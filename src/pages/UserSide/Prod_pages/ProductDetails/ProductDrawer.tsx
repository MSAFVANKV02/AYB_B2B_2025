/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import {
  Box,
  Drawer,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  Sheet,
} from "@mui/joy";
// import { Close as CloseIcon } from "@mui/icons-material";
// import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useWindowWidth } from "@react-hook/window-size";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import BannerWrapper from "@/components/landings/maniHome/Banners/BannerWrapper";
import Banner from "@/components/landings/maniHome/Banners/Banner";
import { Input } from "@/components/ui/input";
import {
  IFinalProductTypes,
  IFinalVariation,
  Product,
} from "@/types/final-product-types";
import { useSetSearchParams } from "@/hooks/use-set-searchParams";
import Image from "@/components/global/image";
import { useAppSelector } from "@/redux/hook";

type IDrawerTypes = {
  product?: Product;
  setBuyOpen: (open: boolean) => void;
  open: boolean;
  buyNow: boolean;
  stockData?: IFinalProductTypes[];
};

export default function ProductDrawer({
  product,
  buyNow,
  //   open,
  setBuyOpen,
}: IDrawerTypes) {
  const { products: stockData } = useAppSelector((state) => state.products);

  const [open, setOpen] = React.useState(false);
  const [selectedVariant, setSelectedVariant] =
    React.useState<IFinalVariation | null>(product?.variations?.[0] ?? null);
  const [quantities, setQuantities] = React.useState<{
    [variantId: string]: { [size: string]: number };
  }>({});
  console.log(product);
  // console.log(selectedVariant, "selectedVariant");
  // console.log(products, "stockData");
  // console.log(quantities, "quantities");

  const onlyWidth = useWindowWidth();
  const setQueryParams = useSetSearchParams();
  //   const desktopsWidth = onlyWidth >= 1024;
  //   const tabletsWidth = onlyWidth < 900;
  //   const xlScreen = onlyWidth < 1440;
  const mobileWidth = onlyWidth < 768;
  const [clicked, setClicked] = React.useState(false);
  const [cartItems, setCartItems] = React.useState<any[]>([]);

  console.log(cartItems, "cartItems");

  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  // makeToastWarning(`${currentImageIndex}`)

  const handleClick = () => {
    const hasQuantities = Object.values(quantities).some((sizeMap) =>
      Object.values(sizeMap).some((qty) => qty > 0)
    );
    if (!hasQuantities) return;
    // Add the clicked state to trigger animations
    setClicked(true);
    // generateCartItems();

    // Reset the state after 3 seconds (3000 ms)
    setTimeout(() => {
      setClicked(false);
    }, 3000);
  };

  const handleIncrease = (
    variantId: string,
    size: string,
    bundleQuantity: number
  ) => {
    setQuantities((prev) => {
      const currentQty = prev[variantId]?.[size] || 0;
  
      const sizeDetail = selectedVariant?.details.find(
        (detail) => detail.size === size
      );
      const stockAvailable = sizeDetail?.stock || 0;
  
      // Check if we are already at max stock
      if (currentQty >= stockAvailable) {
        return prev; // No changes
      }
  
      let updatedQuantities = { ...prev };
  
      if (product?.selectWise === "bundle") {
        const newQty =
          Math.min(
            (Math.floor(currentQty / bundleQuantity) + 1) * bundleQuantity,
            stockAvailable
          );
  
        const updatedSizes: { [size: string]: number } = {};
        selectedVariant?.details.forEach((detail) => {
          updatedSizes[detail.size] = newQty;
        });
  
        updatedQuantities = {
          ...prev,
          [variantId]: updatedSizes,
        };
      } else {
        const newQty = currentQty + 1;
        updatedQuantities = {
          ...prev,
          [variantId]: {
            ...prev[variantId],
            [size]: newQty,
          },
        };
      }
  
      updateCartItems(updatedQuantities);
      return updatedQuantities;
    });
  };
  

  //
  const handleDecrease = (
    variantId: string,
    size: string,
    bundleQuantity: number
  ) => {
    setQuantities((prev) => {
      const currentQty = prev[variantId]?.[size] || 0;
      let updatedQuantities = { ...prev };

      if (product?.selectWise === "bundle") {
        const updatedQty = Math.max(currentQty - bundleQuantity, 0);
        const updatedSizes: { [size: string]: number } = {};

        selectedVariant?.details.forEach((detail) => {
          if (updatedQty > 0) {
            updatedSizes[detail.size] = updatedQty;
          }
        });

        updatedQuantities = {
          ...prev,
          [variantId]: updatedSizes,
        };
      } else {
        const newQty = Math.max(currentQty - 1, 0);
        updatedQuantities = {
          ...prev,
          [variantId]: {
            ...prev[variantId],
            [size]: newQty,
          },
        };
        if (newQty === 0) delete updatedQuantities[variantId][size];
        if (Object.keys(updatedQuantities[variantId]).length === 0)
          delete updatedQuantities[variantId];
      }

      updateCartItems(updatedQuantities);
      return updatedQuantities;
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    variantId: string,
    size: string
  ) => {
    const rawValue = parseInt(e.target.value, 10) || 0;
    const value = Math.max(rawValue, 0);
    const variant = selectedVariant;
    const detail = variant?.details.find((d) => d.size === size);
    const stock = detail?.stock ?? Infinity;
    const bundleQuantity = detail?.bundleQuantity ?? 1;

    setQuantities((prev) => {
      let updatedQuantities = { ...prev };

      if (product?.selectWise === "bundle") {
        const newQty = Math.min(
          Math.floor(value / bundleQuantity) * bundleQuantity,
          stock
        );

        const updatedSizes: { [size: string]: number } = {};
        variant?.details.forEach((detail) => {
          updatedSizes[detail.size] = newQty;
        });

        updatedQuantities = {
          ...prev,
          [variantId]: updatedSizes,
        };
      } else {
        const newQty = Math.min(value, stock);
        updatedQuantities = {
          ...prev,
          [variantId]: {
            ...prev[variantId],
            [size]: newQty,
          },
        };
      }

      updateCartItems(updatedQuantities);
      return updatedQuantities;
    });
  };

  const handleSelectVariant = (variant: IFinalVariation) => {
    setSelectedVariant(variant);
    setQuantities((prev) => {
      if (!prev[variant._id]) {
        const defaultSizes: { [size: string]: number } = {};
        variant.details.forEach((d) => {
          defaultSizes[d.size] = 1;
        });
        return {
          ...prev,
          [variant._id]: defaultSizes,
        };
      }
      return prev;
    });
  };

  const updateCartItems = (quantitiesToUse: typeof quantities) => {
    if (!product) return;

    const items = Object.entries(quantitiesToUse).map(
      ([variantId, sizeMap]) => {
        const variant = product.variations.find((v) => v._id === variantId);
        if (!variant) return null;

        const preferred_size = Object.entries(sizeMap)
          .filter(([_, qty]) => qty > 0)
          .map(([size, qty]) => ({ size, quantity: qty }));

        // If preferred_size is empty, skip adding this item
        if (preferred_size.length === 0) return null;

        return {
          product: stockData[0]._id,
          store: stockData?.[0]?.store?._id ?? "",
          stock_variant: variant._id,
          purchaseType: "NORMAL",
          preferred_size,
        };
      }
    );

    // Filter out nulls and items with empty preferred_size
    setCartItems(
      items.filter((item) => item && item.preferred_size.length > 0)
    );
  };

  const isVariantInCart = (variantId: string) => {
    const isInCart = cartItems.some((item) => item.stock_variant === variantId);
    return isInCart ? true : false;
  };

  const variantQuantityMap: { [variantId: string]: number } = {};

  cartItems.forEach((item) => {
    const totalQty = item.preferred_size.reduce(
      (sum: number, s: any) => sum + s.quantity,
      0
    );

    if (variantQuantityMap[item.stock_variant]) {
      variantQuantityMap[item.stock_variant] += totalQty;
    } else {
      variantQuantityMap[item.stock_variant] = totalQty;
    }
  });

  // cart price
  const getPriceForSize = React.useCallback(() => {
    if (!product?.price_per_pieces?.length || !cartItems?.length) return null;

    let matchedPrice: number | null = null;

    for (const item of cartItems) {
      for (const pref of item.preferred_size) {
        const matchingTier = product.price_per_pieces.find(
          (tier) =>
            pref.quantity >= tier.minPiece && pref.quantity <= tier.maxPiece
        );

        if (matchingTier) {
          matchedPrice = matchingTier.purchase_Amount;
          break; // Stop on the first match
        }
      }

      if (matchedPrice !== null) break;
    }

    // Fallback to the first tier if nothing matched
    return matchedPrice ?? product.price_per_pieces[0]?.purchase_Amount ?? null;
  }, [cartItems, product]);

  return (
    <React.Fragment>
      {!buyNow ? (
        <>
          {product?.variations.map((variant, index) => (
            <div
              className={`${currentImageIndex === index ? "border-2 border-blue-400" : "border-gray-200"} w-14 h-14 rounded-sm  overflow-hidden`}
              key={index}
            >
              <img
                src={variant.image}
                alt={"drawer images"}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setOpen(true);
                  setQueryParams({
                    color: variant.colorName,
                    // available: true,
                  });
                }}
                className={` object-cover w-full h-full cursor-pointer `}
              />
            </div>
          ))}
        </>
      ) : (
        <Button
          className="w-full rounded-xl h-11"
          variant="b2bStyle"
          onClick={() => setOpen(true)}
        >
          Buy Now
        </Button>
      )}

      <Drawer
        size="lg"
        variant="plain"
        open={open}
        anchor="right"
        onClose={() => {
          setBuyOpen(false);
          setOpen(false);
        }}
        slotProps={{
          content: {
            sx: {
              bgcolor: "transparent",

              boxShadow: "none",

              width: mobileWidth ? "100%" : "80%",
            },
          },
        }}
      >
        <Stack
          direction={!mobileWidth ? "row" : "column"}
          gap={!mobileWidth ? "40px" : ""}
          height="100%"
          sx={{}}
        >
          {/* Image Slider on the Left */}
          <Box
            width={!mobileWidth ? "40%" : "100%"}
            sx={{ bgcolor: "transparent" }}
            // onClick={() => setOpen(false)}
          >
            <div className="flex justify-center h-full flex-col relative ">
              <div
                className={`absolute z-[999] ${mobileWidth ? "right-2 top-2" : "-right-6 text-white top-10 "}  text-lg cursor-pointer`}
                onClick={() => setOpen(false)}
              >
                <Icon icon={"material-symbols-light:close"} fontSize={30} />
              </div>

              <Box
                height={!mobileWidth ? 600 : 300}
                sx={{ width: "100%" }}
                onClick={(e) => e.preventDefault()}
                bgcolor={"white"}
                borderRadius={!mobileWidth ? "12px" : ""}
              >
                <BannerWrapper
                  isAutoFlow={false}
                  isActive={true}
                  iconSize={29}
                  className="h-full "
                  nextBtnClass=" active:scale-90 duration-300 transition-all bg-transparent "
                  prevBtnClass=" active:scale-90 duration-300 transition-all bg-transparent "
                  btnClass="sm:left-0 sm:right-0 top-1/2 -translate-y-1/2 left-0  right-0"
                  initialSlide={currentImageIndex}
                  setCurrentImageIndex={setCurrentImageIndex}
                >
                  {product?.variations.map((img, index) => (
                    <Banner
                      className="md:h-[600px] h-[250px]  flex items-center justify-center "
                      isLink={false}
                      image={img.image}
                      key={index}
                      imgClass="object-cover cursor-pointer z-50 lg:w-[70%] md:w-[90%] lg:h-[70%] w-[50%] h-[100%]"
                    />
                  ))}
                </BannerWrapper>
              </Box>
            </div>
          </Box>

          {/* Drawer Content on the Right */}
          <Sheet
            sx={{
              py: 2,
              px: !mobileWidth ? 4 : 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "auto",
              width: "100%",
              borderTopLeftRadius: !mobileWidth ? "20px" : "",
              borderBottomLeftRadius: !mobileWidth ? "20px" : "",
              bgcolor: "white",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography level="h4">Select variations and quantity</Typography>
            </Box>

            {/* #Price Tiers =========== */}
            <Box>
              <Typography level="body-sm" fontWeight="bold" marginTop={"10px"}>
                Price before shipping
              </Typography>

              <Box width={mobileWidth ? "100%" : "70%"}>
                <div className="grid grid-cols-2  w-full ">
                  {product?.price_per_pieces.map((price, index) => (
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ my: 1 }}
                      key={index}
                    >
                      <Box>
                        <Typography level="body-sm">
                          {price.minPiece}-{price.maxPiece} pieces
                        </Typography>
                        <Typography level="h4" fontWeight="00">
                          ₹{price.purchase_Amount}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </div>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* #Color Options */}
            <Typography level="body-sm" fontWeight="bold">
              1. Color {product?.variations.length}: Red
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {product?.variations.map((variant, index) => (
                <div className="relative" key={index}>
                  <Image
                    src={variant.image}
                    alt={"drawer images"}
                    onClick={() => {
                      // setSelectedVariant(variant);
                      handleSelectVariant(variant);
                      setOpen(true);
                    }}
                    className={`w-14 h-14 object-cover cursor-pointer rounded-sm  border-2
                       ${selectedVariant?._id === variant._id ? "border-textMain " : ""} `}
                  />
                  {cartItems.length > 0 && isVariantInCart(variant._id) && (
                    <span className="h-6 min-w-6 w-fit bg-bg text-xs absolute rounded-full flex justify-center items-center text-white p-1 -top-2 -right-2  z-50">
                      {variantQuantityMap[variant._id]}
                    </span>
                  )}
                </div>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Size Options */}
            <Typography level="body-sm" fontWeight="bold">
              2. Size ({selectedVariant?.details.length})
            </Typography>
            <List sx={{ mt: 1 }}>
              {selectedVariant?.details.map((size, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2, // Adds space between columns
                  }}
                >
                  <Typography sx={{ flex: "1 1 0" }}>{size.size}</Typography>
                  {/* ====== purchase Price goes here */}
                  <Typography sx={{ flex: "1 1 0", textAlign: "left" }}>
                    ₹{getPriceForSize()?.toFixed(2) ?? product?.price_per_pieces[0].purchase_Amount}
                  </Typography>

                  {/* Qty buttons */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      border: "1px solid #d0c7c7",
                      padding: "3px",
                      borderRadius: "5px",
                    }}
                  >
                    <Button
                      variant="secondary"
                      className="rounded-sm"
                      onClick={() =>
                        handleDecrease(
                          selectedVariant._id,
                          size.size,
                          size.bundleQuantity
                        )
                      }
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      className="w-20   text-center text-black border-b"
                      value={quantities[selectedVariant._id]?.[size.size] || 0}
                      onChange={(e) =>
                        handleInputChange(e, selectedVariant._id, size.size)
                      }
                    />
                    <Button
                      variant="outline"
                      className="border-gray-200 text-textMain rounded-sm"
                      onClick={() =>
                        handleIncrease(
                          selectedVariant._id,
                          size.size,
                          size.bundleQuantity
                        )
                      }
                    >
                      +
                    </Button>
                  </Stack>
                </ListItem>
              ))}
            </List>

            {/* <Divider sx={{ my: 2 }} /> */}

            {/* Subtotal and Actions */}
            <Box
              sx={{
                mt: "auto",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                padding: "16px",
              }}
              className=""
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography level="body-sm">Item subtotal (0 items)</Typography>
                <Typography level="body-sm">₹0.00</Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ my: 1 }}
              >
                <Typography level="body-sm">Shipping total</Typography>
                <Typography level="body-sm">₹0.00</Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                fontWeight="bold"
              >
                <Typography>Subtotal</Typography>
                <Typography>₹0.00</Typography>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {/* <Button variant="outline" color="neutral" className="w-full">
                  Add to cart
                </Button> */}
                <Button
                  variant="outline"
                  className={`cart-button ${clicked ? "clicked" : ""} w-full border border-black `}
                  onClick={handleClick}
                >
                  <span className="add-to-cart">Add to cart</span>
                  <span className="added">Added</span>
                  <i className="fas fa-shopping-cart"></i>
                  <i className="fas fa-box"></i>
                </Button>
                {/* <Button variant="b2bStyle" className="w-full">
                  Continue to order
                </Button> */}
              </Stack>
            </Box>
          </Sheet>
        </Stack>
      </Drawer>
    </React.Fragment>
  );
}
