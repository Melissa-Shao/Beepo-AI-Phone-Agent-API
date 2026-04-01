import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/Authorization";
import "../App.css";

export default function LogoutButton() {
    const { signout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        signout(() => navigate("/login"));
    };

    return (
        <button className='logout-button' onClick={handleLogout}>
            Log out
        </button>
    );
}