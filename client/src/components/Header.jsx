import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, House, Phone, Search, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "../context/CartContext";
import "../styles/header.css";

const readUser = () => { try { return JSON.parse(localStorage.getItem("homeai_user") || "null"); } catch { return null; } };

function Header() {
    const [search, setSearch] = useState("");
    const [user, setUser] = useState(readUser);
    const navigate = useNavigate();
    const location = useLocation();
    const { itemCount } = useCart();
    const [favoriteCount, setFavoriteCount] = useState(() => { try { return JSON.parse(localStorage.getItem("homeai_favorites") || "[]").length; } catch { return 0; } });
    useEffect(() => {
        const refresh = () => { setUser(readUser()); try { setFavoriteCount(JSON.parse(localStorage.getItem("homeai_favorites") || "[]").length); } catch { setFavoriteCount(0); } };
        refresh();
        window.addEventListener("focus", refresh); window.addEventListener("storage", refresh);
        return () => { window.removeEventListener("focus", refresh); window.removeEventListener("storage", refresh); };
    }, [location.pathname]);
    const submitSearch = (event) => { event.preventDefault(); navigate(`/products?search=${encodeURIComponent(search.trim())}`); };
    const accountName = user?.full_name?.trim().split(/\s+/).pop() || "Tài khoản";
    const accountPath = "/account";
    return <header className="homeai-header"><div className="header-top"><div className="top-left"><span>Hà Nội, Việt Nam</span><span>Miễn phí vận chuyển toàn quốc</span><span>Bảo hành chính hãng</span></div><div className="top-right"><span>Hệ thống showroom</span><span>Video</span><span>Khuyến mại</span><span>Tra cứu bảo hành</span></div></div><div className="header-main"><Link to="/" className="header-logo"><div className="logo-box"><House size={30} /></div><div className="logo-content"><strong>HomeAI</strong><span>SMART INTERIOR</span></div></Link><nav className="main-menu"><Link to="/">Trang chủ</Link><Link to="/products">Sản phẩm</Link><Link to="/ai-design">Thiết kế AI</Link><Link to="/projects">Dự án mẫu</Link><Link to="/contact">Liên hệ</Link></nav><form className="header-search" onSubmit={submitSearch}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm sản phẩm..." /><button aria-label="Tìm kiếm"><Search size={21} /></button></form><div className="header-hotline"><div className="hotline-icon"><Phone size={21} /></div><div><strong>1900 0323</strong><span>Tư vấn miễn phí</span></div></div><div className="header-actions"><button className="header-icon" type="button" onClick={() => navigate("/favorites")} aria-label="Yêu thích"><Heart size={22} /><span className="badge">{favoriteCount}</span></button><Link to="/cart" className="header-icon" aria-label="Giỏ hàng"><ShoppingCart size={23} /><span className="badge">{itemCount}</span></Link>{user ? <Link to={accountPath} className="account-pill"><span>{accountName}</span><UserRound size={22} /></Link> : <Link to="/login" className="header-icon" aria-label="Đăng nhập"><UserRound size={22} /></Link>}</div></div></header>;
}
export default Header;
