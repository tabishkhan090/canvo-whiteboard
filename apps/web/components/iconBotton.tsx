import { ReactNode } from "react";

export function IconButton({
    icon, onclick, activated
}: {
    icon: ReactNode,
    onclick: () => void,
    activated: boolean
}){
    return <div style={{
        margin: "8px",
        border: "2px solid white",
        padding: "8px",
        color: activated ? "red" : "white",
        cursor: "pointer",
        borderRadius: "50%"
        }} 
    onClick={onclick}>
        {icon}
    </div>
}