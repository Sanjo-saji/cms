import { NavbarIcons } from "@/constants/image-constant";
import { useNavigate } from "react-router-dom";
const Checkout = () => {
  const CheckoutIcon = NavbarIcons.checkout;
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate("/book-checkouts");
  };

  return (
    <button
      className="p-3 rounded-full hover:bg-[#27272A] transition-colors"
      onClick={handleCheckout}
      aria-label="Checkout">
      <img src={CheckoutIcon} alt="checkout" className="w-8 h-8" />
    </button>
  );
};

export default Checkout;
