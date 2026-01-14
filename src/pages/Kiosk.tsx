import { useEffect, useMemo, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useLocation, useNavigate } from "react-router-dom";
import { endGame, startGame } from "../api/game";
import { getMenuDetail, getMenuSummary } from "../api/menu";
import { requestNextOrder, scoreOrder } from "../api/order";
import type { MenuCategory } from "../api/menu";

const fallbackCategories = ["버거", "세트", "음료", "기타"];

type MenuItem = { id: string; name: string; image: string };
type ToppingItem = { id: string; name: string; image: string };
type CartItem = MenuItem & { toppings: ToppingItem[]; quantity: number };

type Mission = {
  id: string;
  title: string;
  requirements: { name: string; quantity: number }[];
  selection?: {
    category: string;
    item: { name: string; img: string };
    topping?: { group: string; item: { name: string; img: string } }[] | null;
  };
};

const menuByCategory: Record<string, MenuItem[]> = {
  버거: Array.from({ length: 8 }, (_, index) => ({
    id: `burger-${index + 1}`,
    name: "불고기버거",
    image: "/bulgogi.svg",
  })),
  세트: Array.from({ length: 6 }, (_, index) => ({
    id: `set-${index + 1}`,
    name: "불고기버거 세트",
    image: "/bulgogi.svg",
  })),
  음료: Array.from({ length: 6 }, (_, index) => ({
    id: `drink-${index + 1}`,
    name: "콜라",
    image: "/bulgogi.svg",
  })),
  기타: Array.from({ length: 6 }, (_, index) => ({
    id: `etc-${index + 1}`,
    name: "감자튀김",
    image: "/bulgogi.svg",
  })),
};

const AppShell = styled.div`
  min-height: 100vh;
  padding: 24px 16px 80px;
  background: #ffffff;
`;

const Screen = styled.main`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 24px;
`;

const Timer = styled.div`
  font-size: 24px;
`;

const MissionBox = styled.section`
  background: #dff3cf;
  border-radius: 14px;
  padding: 14px 16px;
  font-weight: 600;
  line-height: 1.5;
  white-space: pre-line;
`;

const CategoryRow = styled.div`
  display: flex;
  gap: 10px;
`;

const CategoryButton = styled.button<{ active: boolean }>`
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 10px 0;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ active }) => (active ? "#2f2f2f" : "#ececec")};
  color: ${({ active }) => (active ? "#ffffff" : "#1f2937")};
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const MenuCard = styled.button`
  border: none;
  border-radius: 18px;
  padding: 12px;
  background: #f4f4f4;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const MenuImage = styled.img`
  width: 120px;
  height: 90px;
  object-fit: contain;
`;

const MenuName = styled.div`
  font-weight: 700;
`;

const SheetOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? "auto" : "none")};
  transition: opacity 0.2s ease;
`;

const TimeOverOverlay = styled.div<{ open: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(148, 163, 184, 0.6);
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? "auto" : "none")};
  transition: opacity 0.2s ease;
  z-index: 40;
`;

const TimeOverModal = styled.div<{ open: boolean }>`
  position: fixed;
  left: 50%;
  top: 50%;
  width: min(320px, 90vw);
  transform: translate(-50%, -50%);
  background: #ffffff;
  border-radius: 16px;
  padding: 20px 18px 18px;
  text-align: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.2);
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? "auto" : "none")};
  transition: opacity 0.2s ease;
  z-index: 41;
`;

const TimeOverTitle = styled.div`
  color: #ef4444;
  font-size: 28px;
  font-weight: 700;
`;

const TimeOverSubtitle = styled.div`
  margin-top: 6px;
  color: #64748b;
  font-weight: 600;
`;

const TimeOverScoreLabel = styled.div`
  margin-top: 12px;
  color: #0f172a;
  font-weight: 600;
`;

const TimeOverScoreValue = styled.div`
  margin-top: 4px;
  font-size: 36px;
  font-weight: 800;
`;

const BottomSheet = styled.div<{ open: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  padding: 12px 18px 20px;
  transform: translateY(${({ open }) => (open ? "0%" : "100%")});
  transition: transform 0.2s ease;
  box-shadow: 0 -8px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  max-height: 80vh;
`;

const SheetHandle = styled.div`
  width: 56px;
  height: 6px;
  border-radius: 999px;
  background: #cbd5f5;
  margin: 4px auto 10px;
`;

const SheetTitle = styled.h3`
  margin: 8px 0 10px;
  font-size: 20px;
  font-weight: 700;
`;

const SheetSectionTitle = styled.p`
  margin: 0 0 6px;
  font-weight: 700;
  color: #64748b;
`;

const SheetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
`;

const SheetContent = styled.div`
  flex: 1;
  overflow: auto;
  padding-right: 2px;
`;

const SheetCard = styled.button<{ selected?: boolean }>`
  border: 2px solid ${({ selected }) => (selected ? "#84cc16" : "transparent")};
  border-radius: 16px;
  padding: 12px 10px;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const SheetImage = styled.img`
  width: 64px;
  height: 64px;
  object-fit: contain;
`;

const SheetName = styled.div`
  font-weight: 700;
`;

const CartSheet = styled(BottomSheet)`
  min-height: 520px;
  display: flex;
  flex-direction: column;
  height: 70vh;
  max-height: 80vh;
`;

const PaymentSheet = styled(BottomSheet)`
  min-height: 520px;
  display: flex;
  flex-direction: column;
  height: 70vh;
  max-height: 80vh;
`;

const CartTitle = styled.h3`
  margin: 8px 0 12px;
  font-size: 20px;
  font-weight: 700;
`;

const CartList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const CartContent = styled.div`
  flex: 1;
  overflow: auto;
`;

const EmptyCart = styled.div`
  flex: 1;
  min-height: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #adadad;
  font-weight: 600;
`;

const EmptyCartIcon = styled.img`
  width: 44px;
  height: 44px;
`;

const CartItemRow = styled.div`
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 12px;
  align-items: center;
  background: #f8fafc;
  border-radius: 16px;
  padding: 10px;
`;

const CartItemImage = styled.img`
  width: 86px;
  height: 70px;
  object-fit: contain;
`;

const CartItemInfo = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 72px;
  padding-right: 70px;
`;

const CartItemName = styled.div`
  font-weight: 700;
`;

const CartItemToppings = styled.div`
  color: #adadad;
  line-height: 1.4;
  font-weight: 400;
`;

const QuantityRow = styled.div`
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: #e2e8f0;
  font-weight: 700;
`;

const QuantityValue = styled.div`
  min-width: 22px;
  text-align: center;
  font-weight: 700;
`;

const PurchaseButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 14px 16px;
  background: #d7fbbf;
  font-size: 20px;
  font-weight: 700;
  color: #2f6f1a;
  cursor: pointer;

  &:disabled {
    background: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }
`;

const PaymentTitle = styled.h3`
  margin: 8px 0 12px;
  font-size: 20px;
  font-weight: 700;
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const PaymentOption = styled.button`
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 30px;
  font-weight: 700;
`;

const CashOption = styled(PaymentOption)`
  background: #ededed;
`;

const CardOption = styled(PaymentOption)`
  background: #d7fbbf;
`;

const PaymentIcon = styled.img<{ size?: number }>`
  width: ${({ size }) => (size ? `${size}px` : "44px")};
  height: ${({ size }) => (size ? `${size}px` : "44px")};
`;

const AddToCartButton = styled.button`
  width: 100%;
  border: none;
  border-radius: 16px;
  padding: 14px 16px;
  background: #d7fbbf;
  font-size: 20px;
  font-weight: 700;
  color: #2f6f1a;
`;

const CartButton = styled.button`
  position: fixed;
  right: 20px;
  bottom: 24px;
  width: 86px;
  height: 86px;
  border: none;
  border-radius: 50%;
  background: #b7f08c;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
  font-size: 18px;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
`;

const CartIcon = styled.img`
  width: 30px;
  height: 30px;
`;

const mapMenuToCategory = (menuDetail: MenuCategory) => {
  const list = menuDetail.menus.map((menu, index) => ({
    id: `${menuDetail.kategorie}-${index}`,
    name: menu.name,
    image: menu.img,
  }));
  return list;
};

const mapMenuDetail = (data: MenuCategory[] | null) => {
  if (!data) return null;
  const mapped: Record<string, MenuItem[]> = {};
  data.forEach((category) => {
    mapped[category.kategorie] = mapMenuToCategory(category);
  });
  return mapped;
};

const mapToppings = (data: MenuCategory[] | null, categoryName: string) => {
  if (!data) return null;
  const category = data.find((item) => item.kategorie === categoryName);
  if (!category) return null;
  return category.toping.flatMap((group, index) => {
    return group.items.map((item, idx) => ({
      id: `${index}-${idx}`,
      name: item.name,
      image: item.img,
    }));
  });
};

const formatRequirement = (
  requirements: { name: string; quantity: number }[],
  selection?: Mission["selection"]
) => {
  const base = requirements
    .map((item) => `${item.name} ${item.quantity}개`)
    .join(", ");
  if (!selection?.topping || selection.topping.length === 0) {
    return base;
  }
  const toppings = selection.topping
    .map((item) => item.item.name)
    .join(", ");
  return `${base}\n토핑: ${toppings}`;
};

function Kiosk() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuIdFromState = (location.state as { menuId?: string } | null)?.menuId;
  const [activeCategory, setActiveCategory] = useState<string>(
    fallbackCategories[0]
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedToppings, setSelectedToppings] = useState<ToppingItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [successOrders, setSuccessOrders] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<"cash" | "card" | null>(
    null
  );
  const [gameId, setGameId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [missionFromApi, setMissionFromApi] = useState<Mission | null>(null);
  const [menuDetailData, setMenuDetailData] = useState<MenuCategory[] | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [endScore, setEndScore] = useState<number | null>(null);
  const [userName, setUserName] = useState("사용자");
  const endRequestedRef = useRef(false);
  const items = menuByCategory[activeCategory] ?? [];
  const [remainingSeconds, setRemainingSeconds] = useState(60);

  const missions = useMemo<Mission[]>(
    () => [
      {
        id: "m1",
        title: "베이컨토마토블루베리버거",
        requirements: [
          { name: "불고기버거 세트", quantity: 2 },
          { name: "감자튀김", quantity: 1 },
          { name: "콜라", quantity: 1 },
          { name: "사이다", quantity: 1 },
        ],
      },
      {
        id: "m2",
        title: "햄버거 세트 주문",
        requirements: [
          { name: "불고기버거 세트", quantity: 1 },
          { name: "콜라", quantity: 2 },
        ],
      },
      {
        id: "m3",
        title: "기본 버거 주문",
        requirements: [
          { name: "불고기버거", quantity: 2 },
          { name: "감자튀김", quantity: 1 },
        ],
      },
    ],
    []
  );

  const [missionIndex, setMissionIndex] = useState(0);
  const mission = missionFromApi ?? missions[missionIndex % missions.length];
  const menuData = useMemo(() => mapMenuDetail(menuDetailData), [menuDetailData]);
  const categoryList = useMemo(() => {
    if (!menuDetailData || menuDetailData.length === 0) {
      return fallbackCategories;
    }
    const names = menuDetailData.map((category) => category.kategorie);
    return Array.from(new Set(names));
  }, [menuDetailData]);
  const apiItems = menuData?.[activeCategory];
  const activeItems = apiItems ?? items;

  const toppingGroups = useMemo(() => {
    if (!menuDetailData) return [];
    const category = menuDetailData.find(
      (item) => item.kategorie === activeCategory
    );
    if (!category) return [];
    return category.toping.map((group, index) => ({
      name: group.name,
      items: group.items.map((item, idx) => ({
        id: `${index}-${idx}`,
        name: item.name,
        image: item.img,
      })),
    }));
  }, [menuDetailData, activeCategory]);

  useEffect(() => {
    if (categoryList.length === 0) return;
    if (!categoryList.includes(activeCategory)) {
      setActiveCategory(categoryList[0]);
    }
  }, [categoryList, activeCategory]);

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const initGame = async () => {
      try {
        const summary = await getMenuSummary(1);
        const menuId = menuIdFromState ?? summary[0]?.id;
        if (!menuId) return;
        const startResponse = await startGame(menuId);
        if (cancelled) return;
        setGameId(startResponse.order.game_id);
        setOrderId(startResponse.order.id);
        setMissionFromApi({
          id: startResponse.order.id,
          title: startResponse.order.selection.item.name,
          requirements: [
            {
              name: startResponse.order.selection.item.name,
              quantity: 1,
            },
          ],
          selection: startResponse.order.selection,
        });
        const detail = await getMenuDetail(startResponse.order.menu_id);
        if (!cancelled) {
          setMenuDetailData(detail.data);
        }
      } catch {
        // ignore
      }
    };
    initGame();
    return () => {
      cancelled = true;
    };
  }, []);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timerLabel = `${minutes}:${String(seconds).padStart(2, "0")}`;
  const isTimeOver = remainingSeconds === 0;

  useEffect(() => {
    if (!isTimeOver) return;
    setSelectedItem(null);
    setIsCartOpen(false);
    setIsPaymentOpen(false);

    if (!endRequestedRef.current && gameId) {
      endRequestedRef.current = true;
      endGame(gameId)
        .then((data) => {
          if (typeof data.score === "number") {
            setEndScore(data.score);
          }
        })
        .catch(() => {
          // ignore
        });
    }

    const timeoutId = window.setTimeout(() => {
      navigate("/result", {
        state: {
          score: endScore ?? 0,
          gameId,
          successOrders,
        },
      });
    }, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [isTimeOver, navigate, gameId, endScore, successOrders]);

  const buildCartKey = (item: MenuItem, toppings: ToppingItem[]) => {
    const toppingIds = [...toppings].map((topping) => topping.id).sort();
    return `${item.id}|${toppingIds.join(",")}`;
  };

  const handleAddToCart = () => {
    if (!selectedItem) return;
    setCartItems((prev) => {
      const key = buildCartKey(selectedItem, selectedToppings);
      const next = [...prev];
      const index = next.findIndex(
        (entry) => buildCartKey(entry, entry.toppings) === key
      );
      if (index >= 0) {
        next[index] = {
          ...next[index],
          quantity: next[index].quantity + 1,
        };
        return next;
      }
      return [
        ...prev,
        { ...selectedItem, toppings: selectedToppings, quantity: 1 },
      ];
    });
    setSelectedItem(null);
    setSelectedToppings([]);
  };

  const toggleTopping = (item: ToppingItem) => {
    setSelectedToppings((prev) => {
      const exists = prev.some((topping) => topping.id === item.id);
      if (exists) {
        return prev.filter((topping) => topping.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const isSelected = (item: ToppingItem) =>
    selectedToppings.some((topping) => topping.id === item.id);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((prev) => {
      const next = [...prev];
      const target = next[index];
      if (!target) return prev;
      const nextQty = target.quantity + delta;
      if (nextQty <= 0) {
        next.splice(index, 1);
        return next;
      }
      next[index] = { ...target, quantity: nextQty };
      return next;
    });
  };

  const isMissionMatch = () => {
    const expected = new Map<string, number>();
    mission.requirements.forEach((item) => {
      expected.set(item.name, item.quantity);
    });
    const actual = new Map<string, number>();
    cartItems.forEach((item) => {
      actual.set(item.name, (actual.get(item.name) ?? 0) + item.quantity);
    });
    if (expected.size !== actual.size) return false;
    for (const [name, qty] of expected.entries()) {
      if (actual.get(name) !== qty) return false;
    }
    if (mission.selection && mission.selection.topping) {
      const target = cartItems.find(
        (item) => item.name === mission.selection?.item.name
      );
      const expectedToppings = mission.selection.topping.map(
        (item) => item.item.name
      );
      const actualToppings = target?.toppings.map((item) => item.name) ?? [];
      if (expectedToppings.length !== actualToppings.length) return false;
      const expectedSet = new Set(expectedToppings);
      for (const topping of actualToppings) {
        if (!expectedSet.has(topping)) return false;
      }
    }
    return true;
  };

  const handlePurchase = async () => {
    if (cartItems.length === 0 || isPurchasing) return;
    if (!selectedPayment) return;
    setIsPurchasing(true);

    if (gameId && orderId && cartItems.length > 0) {
      try {
        const primary = cartItems[0];
        await scoreOrder({
          order_id: orderId,
          game_id: gameId,
          category: activeCategory,
          menu_name: primary.name,
          topping_names: primary.toppings.map((item) => item.name),
        });
      } catch {
        // ignore
      }
    }

    if (gameId) {
      try {
        const nextOrder = await requestNextOrder(gameId);
        setOrderId(nextOrder.id);
        setMissionFromApi({
          id: nextOrder.id,
          title: nextOrder.selection.item.name,
          requirements: [
            {
              name: nextOrder.selection.item.name,
              quantity: 1,
            },
          ],
          selection: nextOrder.selection,
        });
      } catch {
        // ignore
      }
    }

    if (isMissionMatch()) {
    const missionLabel = formatRequirement(mission.requirements, mission.selection);
      setSuccessOrders((prev) => [...prev, missionLabel]);
    }
    setCartItems([]);
    setIsPaymentOpen(false);
    setSelectedPayment(null);
    setMissionIndex((prev) => prev + 1);
    setIsPurchasing(false);
  };

  return (
    <AppShell>
      <Screen>
        <Header>
          <Title>
            주문 <span aria-hidden>{"\uD83C\uDFAF"}</span>
          </Title>
          <Timer>{timerLabel}</Timer>
        </Header>

        <MissionBox>
          {formatRequirement(mission.requirements, mission.selection)}
        </MissionBox>

        <CategoryRow>
          {categoryList.map((category) => (
            <CategoryButton
              key={category}
              active={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </CategoryButton>
          ))}
        </CategoryRow>

        <MenuGrid>
          {activeItems.map((item) => (
            <MenuCard
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setIsCartOpen(false);
              }}
            >
              <MenuImage src={item.image} alt="" />
              <MenuName>{item.name}</MenuName>
            </MenuCard>
          ))}
        </MenuGrid>
      </Screen>

      <CartButton
        onClick={() => {
          setIsCartOpen(true);
          setSelectedItem(null);
          setIsPaymentOpen(false);
        }}
      >
        <CartIcon src="/cart.svg" alt="" aria-hidden />
        장바구니
      </CartButton>

      <SheetOverlay
        open={Boolean(selectedItem)}
        onClick={() => setSelectedItem(null)}
      />
      <BottomSheet open={Boolean(selectedItem)}>
        <SheetHandle />
        <SheetTitle>상세 토핑</SheetTitle>
        <SheetContent>
          {toppingGroups.map((group) => (
            <div key={group.name}>
              <SheetSectionTitle>{group.name}</SheetSectionTitle>
              <SheetGrid>
                {group.items.map((item) => (
                  <SheetCard
                    key={item.id}
                    selected={isSelected(item)}
                    onClick={() => toggleTopping(item)}
                  >
                    <SheetImage src={item.image} alt="" />
                    <SheetName>{item.name}</SheetName>
                  </SheetCard>
                ))}
              </SheetGrid>
            </div>
          ))}
        </SheetContent>

        <AddToCartButton onClick={handleAddToCart}>
          장바구니에 담기
        </AddToCartButton>
      </BottomSheet>

      <SheetOverlay open={isCartOpen} onClick={() => setIsCartOpen(false)} />
      <CartSheet open={isCartOpen}>
        <SheetHandle />
        <CartTitle>장바구니</CartTitle>
        <CartContent>
          {cartItems.length === 0 ? (
            <EmptyCart>
              <EmptyCartIcon src="/cart.svg" alt="" aria-hidden />
              메뉴를 골라보세요
            </EmptyCart>
          ) : (
            <CartList>
              {cartItems.map((item, index) => (
                <CartItemRow key={`${item.id}-${index}`}>
                  <CartItemImage src={item.image} alt="" />
                  <CartItemInfo>
                    <CartItemName>{item.name}</CartItemName>
                    <CartItemToppings>
                      토핑:
                      {item.toppings.length === 0
                        ? " 없음"
                        : ` ${item.toppings
                            .map((topping) => topping.name)
                            .join("/")}`}
                    </CartItemToppings>
                    <QuantityRow>
                      <QuantityButton
                        type="button"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        -
                      </QuantityButton>
                      <QuantityValue>{item.quantity}</QuantityValue>
                      <QuantityButton
                        type="button"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        +
                      </QuantityButton>
                    </QuantityRow>
                  </CartItemInfo>
                </CartItemRow>
              ))}
            </CartList>
          )}
        </CartContent>
        <PurchaseButton
          disabled={cartItems.length === 0}
          onClick={() => {
            setIsCartOpen(false);
            setIsPaymentOpen(true);
          }}
        >
          구매하기
        </PurchaseButton>
      </CartSheet>

      <SheetOverlay
        open={isPaymentOpen}
        onClick={() => setIsPaymentOpen(false)}
      />
      <PaymentSheet open={isPaymentOpen}>
        <SheetHandle />
        <PaymentTitle>결제 방식</PaymentTitle>
        <CartContent>
          <PaymentOptions>
            <CashOption
              onClick={() => setSelectedPayment("cash")}
              style={{
                border:
                  selectedPayment === "cash"
                    ? "2px solid #84cc16"
                    : "2px solid transparent",
              }}
            >
              현금 결제
              <PaymentIcon src="/money.svg" alt="" aria-hidden size={110} />
            </CashOption>
            <CardOption
              onClick={() => setSelectedPayment("card")}
              style={{
                border:
                  selectedPayment === "card"
                    ? "2px solid #84cc16"
                    : "2px solid transparent",
              }}
            >
              카드 결제
              <PaymentIcon src="/card.svg" alt="" aria-hidden size={105} />
            </CardOption>
          </PaymentOptions>
        </CartContent>
        <PurchaseButton
          disabled={cartItems.length === 0 || !selectedPayment || isPurchasing}
          onClick={handlePurchase}
        >
          구매하기
        </PurchaseButton>
      </PaymentSheet>

      <TimeOverOverlay open={isTimeOver} />
      <TimeOverModal open={isTimeOver}>
        <TimeOverTitle>시간 끝남</TimeOverTitle>
        <TimeOverSubtitle>뒷사람이 화났어요!!</TimeOverSubtitle>
        <TimeOverScoreLabel>{userName}님의 점수는...</TimeOverScoreLabel>
        <TimeOverScoreValue>{(endScore ?? 0).toLocaleString()}점</TimeOverScoreValue>
      </TimeOverModal>
    </AppShell>
  );
}

export default Kiosk;
