import { Balance, DepthResponse, TradeApiResponse } from "@repo/types";
import { atom, GetRecoilValue, selector } from "recoil";
import { getDepth } from "../utils";
export const user = atom<{
	id: string, balance: Balance
}>({
	key: 'textState', // unique ID (with respect to other atoms/selectors)
	default: {
		id: "1",
		balance: {
			balance: {
				available: 0,
				locked: 0
			}
		},
	},
});
export const symbol = atom<string>({
	key: "symbol",
	default: "TATA_INR",
})
export const ticker = atom<number>({
	key: "ticker",
	default: Number((Math.random() * 100).toFixed(2))
})
const DepthData = selector({
	key: "Depth Data",
	get: async ({ get }: { get: GetRecoilValue }) => {
		const response = await getDepth(get(user).id, get(symbol))
		return (response.data)
	},
	dangerouslyAllowMutability: true
})
export const TradesState = atom<TradeApiResponse>({
	key: "Trades",
	default: []
})
export const DepthState = atom<DepthResponse>({
	key: "Depth",
	default: DepthData,
	dangerouslyAllowMutability: true
})
