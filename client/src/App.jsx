import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Header from "./components/Header";
import Favorites from "./pages/Favorites";
import AIDesign from "./pages/AIDesign";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminList from "./pages/AdminList";
import Account from "./pages/Account";
import AdminSettings from "./pages/AdminSettings";
function App() {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith("/admin");

    return (
        <>
            {!isAdminRoute && <Header />}

            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/products" element={<Products />} />

                <Route
                    path="/products/:id"element={<ProductDetail />}
                />
                <Route path="/cart" element={<Cart />} />

                <Route path="/favorites" element={<Favorites />} />
                <Route path="/ai-design" element={<AIDesign />} />
                <Route path="/ai-consultation" element={<AIDesign />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/contact" element={<Contact/>}></Route>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<Account />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/customers" element={<AdminList />} />
                <Route path="/admin/orders" element={<AdminList />} />
                <Route path="/admin/contacts" element={<AdminList />} />
                <Route path="/admin/products" element={<AdminList />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
            </Routes>
        </>
    );
}

export default App;
