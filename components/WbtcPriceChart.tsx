"use client";

import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import redstone from "redstone-api";

interface PricePoint {
  timestamp: number;
  price: number;
  date: string;
}

// Interface for RedStone historical price data point
interface RedStonePricePoint {
  value: number;
  timestamp: number;
  provider?: string; // Optional properties based on RedStone API response
  permawebTx?: string;
  source?: string | Record<string, number> | undefined;
}

export const WbtcPriceChart = () => {
  // Replace useSWR with standard state for data, loading, and error
  const [rawData, setRawData] = useState<RedStonePricePoint[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [currentPrice, setCurrentPrice] = useState<string>("Loading...");
  const [priceChange, setPriceChange] = useState<number>(0);

  // Fetch data using RedStone API in a useEffect hook
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7); // Get data for the last 7 days

        // Fetch historical price data for BTC (RedStone uses BTC symbol)
        // Interval: 1 hour (3600 * 1000 ms) - adjust as needed
        const prices: RedStonePricePoint[] = await redstone.getHistoricalPrice("BTC", {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          interval: 3600 * 1000, 
        });

        setRawData(prices);
      } catch (err) {
        console.error("Error fetching RedStone data:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch RedStone data"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Optional: Set up an interval to refetch data periodically
    const intervalId = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Empty dependency array means this runs once on mount + cleanup

  useEffect(() => {
    // Process the rawData from RedStone when it's available
    if (rawData && rawData.length > 0) {
      // Format the data for the chart - adapt to RedStone's format { value, timestamp }
      const formattedData = rawData.map((item: RedStonePricePoint) => {
        const date = new Date(item.timestamp);
        return {
          timestamp: item.timestamp,
          price: item.value, // Use 'value' from RedStone data
          date: `${date.toLocaleDateString()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`,
        };
      }).sort((a, b) => a.timestamp - b.timestamp); // Ensure data is sorted by time

      setChartData(formattedData);

      // Get the current price and calculate change
      if (formattedData.length > 0) {
        const latestPrice = formattedData[formattedData.length - 1].price;
        setCurrentPrice(latestPrice.toLocaleString('en-US', { 
          style: 'currency', 
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }));

        // Calculate 24h price change percentage (approximate based on available data points)
        const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
        // Find the closest data point to 24 hours ago
        let oneDayAgoPrice = formattedData[0].price; // Default to oldest price if none found
        for (let i = formattedData.length - 1; i >= 0; i--) {
          if (formattedData[i].timestamp <= twentyFourHoursAgo) {
            oneDayAgoPrice = formattedData[i].price;
            break; 
          }
        }
        
        const changePercent = ((latestPrice - oneDayAgoPrice) / oneDayAgoPrice) * 100;
        setPriceChange(changePercent);
      }
    } else if (rawData && rawData.length === 0) {
      // Handle case where RedStone returns an empty array
      setChartData([]);
      setCurrentPrice("N/A");
      setPriceChange(0);
    }
  }, [rawData]); // This effect runs whenever rawData changes

  // A simple canvas-based chart (no TypeScript issues)
  const renderSimpleChart = () => {
    if (!chartData || chartData.length === 0) return null;

    // Find min and max for scale
    const prices = chartData.map(point => point.price);
    const minPrice = Math.min(...prices) * 0.995; // Add a small margin
    const maxPrice = Math.max(...prices) * 1.005;
    const range = maxPrice - minPrice;

    // Generate SVG path with smoothing
    // Create a cubic bezier curve for smoother lines
    const createSmoothPath = (points: { x: number, y: number }[]) => {
      if (points.length < 2) return '';
      
      let path = `M ${points[0].x},${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const x1 = points[i].x;
        const y1 = points[i].y;
        const x2 = points[i + 1].x;
        const y2 = points[i + 1].y;
        
        // Calculate control points for the curve
        const controlX1 = x1 + (x2 - x1) / 3;
        const controlY1 = y1;
        const controlX2 = x2 - (x2 - x1) / 3;
        const controlY2 = y2;
        
        path += ` C ${controlX1},${controlY1} ${controlX2},${controlY2} ${x2},${y2}`;
      }
      
      return path;
    };

    const pointsForPath = chartData.map((point, index) => {
      const x = (index / (chartData.length - 1)) * 100;
      const y = 100 - ((point.price - minPrice) / range) * 100;
      return { x, y };
    });

    const smoothPath = createSmoothPath(pointsForPath);
    const areaPath = `${smoothPath} L 100,100 L 0,100 Z`;

    return (
      <div className="relative h-[200px] w-full mt-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Gradient fill */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area under the curve */}
          <path 
            d={areaPath} 
            fill="url(#gradient)" 
            strokeWidth="0"
          />

          {/* The line */}
          <path 
            d={smoothPath} 
            fill="none" 
            stroke="#22C55E" 
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Price points - only show a few key points */}
          {chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0).map((point, i) => {
            const x = (i * Math.max(1, Math.floor(chartData.length / 6)) / (chartData.length - 1)) * 100;
            const y = 100 - ((point.price - minPrice) / range) * 100;
            
            return (
              <circle
                key={point.timestamp}
                cx={x}
                cy={y}
                r="0.8"
                fill="#22C55E"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          {chartData.filter((_, i) => i % Math.max(1, Math.floor(chartData.length / 6)) === 0).map((point) => (
            <div key={point.timestamp} className="text-center">
              {new Date(point.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
          <div>${Number(maxPrice.toFixed(0)).toLocaleString()}</div>
          <div>${Number(((maxPrice + minPrice) / 2).toFixed(0)).toLocaleString()}</div>
          <div>${Number(minPrice.toFixed(0)).toLocaleString()}</div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 w-full">
        <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
        <p>Unable to load WBTC price data. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <div className="text-xs text-right">
          Price feed fetched from <span className="text-purple-600">RedStone Oracle</span>
        </div>
        <div className="text-xs">7-day BTC Price Chart</div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-center">
          <h2 className="text-4xl font-bold">{currentPrice}</h2>
          <p className="flex items-center">
            <span className={priceChange >= 0 ? "text-green-600" : "text-red-600"}>
              {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
              <span className="ml-1">
                {priceChange >= 0 ? "↑" : "↓"}
              </span>
            </span>
            <span className="ml-2 text-sm">
              BTC/USD 
            </span>
          </p>
        </div>
      </div>

      {renderSimpleChart()}
    </div>
  );
}; 