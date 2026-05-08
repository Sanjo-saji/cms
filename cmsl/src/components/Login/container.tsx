import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "@/hooks/form";
import Api from "../../Api/api";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Login = () => {
  const [formValues, handleChange] = useForm({ employeeId: "", password: "" });
  const navigate = useNavigate();

  const userLogin = async () => {
    try {
      const response = await Api.post("/auth/login-library", {
        employeeId: formValues.employeeId,
        password: formValues.password,
      });

      if (response.data.success) {
        const token = response.data.token;
        // Save token to localStorage
        localStorage.setItem("token", token);
        toast.success("Login successful!");
        console.log("Login successful, token saved:", token);

        // Redirect to home
        navigate("/");
      } else {
        toast.error("Login failed: " + response.data.message);
        console.error("Login failed:", response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred during login.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex justify-center w-[420px] h-[290px] bg-[#171717] p-4 rounded-xl border-2 border-[#353535]">
      <div>
        <div>
          <p className="text-[20px]">Login your account</p>
        </div>
        <div>
          <Input
            placeholder="Employee ID"
            className="mt-5 w-[350px] bg-[#212121] border-[#424242] p-5"
            name="employeeId"
            value={formValues.employeeId}
            onChange={handleChange}
          />
          <Input
            placeholder="Password"
            className="mt-3 w-[350px] bg-[#212121] border-[#424242] p-5"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
          />
        </div>
        <Button
          onClick={userLogin}
          className="bg-white hover:bg-[#FFFFFFCC] text-black mt-5 w-[350px] p-5 text-[20px] font-bold font-sans"
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
