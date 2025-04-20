import { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { getKlines } from "../utils";
import { KLine } from "../types";

export function TradeView({
  market,
  price,
}: {
  market: string;
  price: string;
}) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);
  const lastCandleTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      let klineData: KLine[] = [];

      try {
        klineData = await getKlines(
          market,
          "1m",
          Math.floor((Date.now() - 1000 * 60 * 60 * 24 * 7) / 1000),
          Math.floor(Date.now() / 1000)
        );
      } catch (e) {
        console.error("Error fetching Klines:", e);
      }

      if (chartRef.current) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }

        const parsedData = klineData
          ?.map((x) => ({
            open: parseFloat(x.open),
            high: parseFloat(x.high),
            low: parseFloat(x.low),
            close: parseFloat(x.close),
            timestamp: new Date(x.end).getTime(),
          }))
          .sort((a, b) => a.timestamp - b.timestamp) || [];

        const chartManager = new ChartManager(chartRef.current, parsedData, {
          background: "#0e0f14",
          color: "white",
        });

        chartManagerRef.current = chartManager;

        // Set last candle time
        if (parsedData.length > 0) {
          lastCandleTimeRef.current = parsedData[parsedData.length - 1].timestamp;
        }
      }
    };

    init();
  }, [market]);

useEffect(() => {
  const chartManager = chartManagerRef.current;
  if (!chartManager) return;

  const numericPrice = parseFloat(price);
  if (isNaN(numericPrice)) return;

  const now = Math.floor(Date.now() / 1000); // time in SECONDS

  const lastTime = lastCandleTimeRef.current || 0;
  const currentMinute = Math.floor(now / 60) * 60;

  let newCandleInitiated = false;

  if (currentMinute > lastTime) {
    newCandleInitiated = true;
    lastCandleTimeRef.current = currentMinute;
  }

  const newBar = {
    open: numericPrice,
    high: numericPrice,
    low: numericPrice,
    close: numericPrice,
    time: currentMinute, // << MUST BE SECONDS
    newCandleInitiated,
  };

  console.log("Updating chart with bar:", newBar);
  chartManager.update(newBar);
}, [price]);


  return (
    <div
      ref={chartRef}
      style={{ height: "520px", width: "100%", marginTop: 4 }}
    />
  );
}
