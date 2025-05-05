import { Outlet } from "react-router"

export const Layout = () => {
    return(
        <div className="px-48">
            <Outlet/>
        </div>
    )
}