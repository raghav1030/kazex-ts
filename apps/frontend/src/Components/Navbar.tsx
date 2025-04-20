import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import { user } from "../state"
import { WebSocketManager } from "../utils/WebSocketManager"
import { BalanceResponse } from "@repo/types"
import { getBalance } from "../utils"

const allUsers: {
    [key: string]: {
        name: string,
        profile: string,
        email: string
    }
} = {
    "1": {
        name: "Raghav Gandhi",
        profile: "/profile.jpg",
        email: "raghav.work@gmail.com"
    },
    "2": {
        name: "Joe GoldBerg",
        profile: "/Joe.jpeg",
        email: "joe@gmail.com"
    },
    "3": {
        name: "Berlin",
        profile: "/Berlin.jpeg",
        email: "berlin@gmail.com"
    }
}
export default function Navbar() {
    const [currentUser, setCurrentUser] = useRecoilState(user)
    const [tabOpened, setTabOpened] = useState(false)
    function toggleTab() {
        setTabOpened(prev => !prev)
    }
    function balanceCallback({ balance, id }: BalanceResponse) {
        setCurrentUser({
            id,
            balance
        })
    }
    function changeUser(id: string) {
        setCurrentUser({
            id,

            // Ugly Fix of Balance zittering because of updating the value to a default value then to new User's Balance : Settting the previous User's Balance skips the middle default value step
            balance: currentUser.balance
        })
        setTabOpened(false)
    }
    useEffect(() => {
        getBalance(currentUser.id).then((data) => {
            setCurrentUser({
                id: currentUser.id,
                balance: data.data.balance
            })
        })
        WebSocketManager.getInstance().sendMessage({
            method: "SUBSCRIBE",
            params: [`balance@${currentUser.id}`]
        })
        WebSocketManager.getInstance().attachCallback("BALANCE", balanceCallback)
        return () => {
            WebSocketManager.getInstance().sendMessage({
                method: "UNSUBSCRIBE",
                params: [`balance@${currentUser.id}`]
            })
            WebSocketManager.getInstance().detachCallback("BALANCE", balanceCallback)
        }
    }, [currentUser.id])

    return (
        <nav className="border-b flex justify-between border-gray-800 py-3 px-10" >
            <div className="flex gap-5 items-center" >
                <div className="logo" >
                    <img className="w-8 rounded-[50%]" src={"/profile.jpg"} alt="" />
                </div>
                < div className="search" >
                    <input type="text" className="rounded-md bg-[#202127] outline-none px-4 py-2 text-sm text-white" placeholder="Search Market" />
                </div>
                < div className="partition h-full w-[1px] bg-[#02a166]" > </div>
                < div className="text-[#02a166] transition-[2s] amount text-2xl" >
                    ₹{currentUser.balance.balance && currentUser.balance.balance.available.toFixed(2)}
                </div>
            </div>
            < div className="relative" >
                <div onClick={toggleTab} className="avatar cursor-pointer flex gap-4 items-center text-white bg-[#202127] py-2 px-5 rounded-xl" >
                    <div>
                        <h1 className="font-Noto text-[12px] font-semibold" > Hi, {allUsers[currentUser.id].name} </h1>
                        < h3 className="text-[10px] py-[1px] opacity-50" > {allUsers[currentUser.id].email} </h3>
                    </div>
                    < img className="w-8 rounded-[50%]" src={allUsers[currentUser.id].profile} alt="" />
                    <svg style={{ transition: "0.2s", rotate: tabOpened ? "180deg" : "" }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" >
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </div>
                < div style={{
                    transition: "0.2s", translate: tabOpened ? "0px" : "100%",
                    opacity: tabOpened ? "1" : "0",
                    boxShadow: `rgba(0, 0, 0, 0.25) 0px 54px 55px, 
                rgba(0, 0, 0, 0.12) 0px -12px 30px, 
                rgba(0, 0, 0, 0.12) 0px 4px 6px, 
                rgba(0, 0, 0, 0.17) 0px 12px 13px, 
                rgba(0, 0, 0, 0.09) 0px -3px 5px`,
                }
                } className="absolute -right-2 bg-[#0e0f14] border-2 border-gray-800 w-max rounded-lg p-5 z-10 my-2" >
                    {
                        Object.entries(allUsers).filter((user) => user[0] !== currentUser.id).map((user) => <div className="avatar cursor-pointer my-1 flex gap-4 justify-between items-center text-white bg-[#202127] py-2 px-5 rounded-xl" onClick={() => {
                            changeUser(user[0])
                        }}>
                            <div>
                                <h1 className="font-Noto text-[12px] font-semibold" > Hi, {user[1].name} </h1>
                                < h3 className="text-[10px] py-[1px] opacity-50" > {user[1].email} </h3>
                            </div>
                            < div className="flex gap-2 items-center" >
                                <img className="w-8 rounded-[50%]" src={user[1].profile} alt="" />
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6" >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>)
                    }
                </div>

            </div>

        </nav>
    )
}
