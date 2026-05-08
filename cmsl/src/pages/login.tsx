import Header from "@/components/Login/header.tsx";
import Container from "@/components/Login/container.tsx";

const Login = () => {
    return <div>
        <Header/>
        <div className={"flex justify-center"}>
            <Container/>
        </div>
    </div>
}
export default Login;