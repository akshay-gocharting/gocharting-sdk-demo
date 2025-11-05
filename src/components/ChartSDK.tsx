import { useEffect, useRef, useState } from "react";
import { Box } from "./Box";
import { Text } from "./Text";
import { useResponsive } from "../hooks/useResponsive";
import { createChartDatafeed } from "../utils/chart-datafeed";
import * as GoChartingSDK from "@gocharting/chart-sdk";

export const ChartSDK = () => {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const widgetRef = useRef<any>(null);
	const [status, setStatus] = useState("Initializing chart...");
	const { isSmallDevice, isMediumDevice } = useResponsive();
	const isMobile = isSmallDevice || isMediumDevice;

	// Demo broker data refs
	const currentAccountList = useRef<any[]>([
		{
			id: "demo-account-1",
			name: "Demo Trading Account",
			balance: 100000,
			currency: "USDT",
		},
	]);
	const currentOrderBook = useRef<any[]>([]);
	const currentTradeBook = useRef<any[]>([]);
	const currentPositions = useRef<any[]>([]);

	useEffect(() => {
		// Initialize chart when component mounts
		const timer = setTimeout(() => {
			initializeChart();
		}, 100);

		return () => {
			clearTimeout(timer);
			// Cleanup chart on unmount
			if (widgetRef.current) {
				try {
					widgetRef.current.remove();
				} catch (e) {
					console.error("Error removing chart:", e);
				}
			}
		};
	}, []);

	// Helper methods
	const setupDemoBrokerData = (chartInstance: any) => {
		console.log("🏦 Setting up demo broker data for trading...");

		const demoBrokerData = {
			accountList: currentAccountList.current,
			orderBook: currentOrderBook.current,
			tradeBook: currentTradeBook.current,
			positions: currentPositions.current,
		};

		try {
			chartInstance.setBrokerAccounts(demoBrokerData);
			console.log("✅ Demo broker data set successfully");
			setStatus("🏦 Demo trading data loaded");
		} catch (error) {
			console.error("❌ Failed to set broker data:", error);
			setStatus("❌ Failed to load trading data");
		}
	};

	const initializeChart = () => {
		if (!GoChartingSDK) {
			setStatus("GoCharting SDK not available");
			return;
		}

		if (!chartContainerRef.current) {
			setStatus("Chart container not available");
			return;
		}

		try {
			const datafeed = createChartDatafeed();

			// Add an ID to the container for the SDK
			if (chartContainerRef.current) {
				chartContainerRef.current.id = "gocharting-chart-container";
			}

			GoChartingSDK.createChart("#gocharting-chart-container", {
				symbol: "BYBIT:FUTURE:BTCUSDT",
				interval: "1D",
				datafeed: datafeed,
				debugLog: false,
				licenseKey: "demo-550e8400-e29b-41d4-a716-446655440000",
				theme: "dark",
				enableTrading: true,
				appCallback: (eventType: string, message: any) => {
					console.log("===== TRADING EVENT RECEIVED =====");
					console.log("Event Type:", eventType);
					console.log("Event Message:", message);
					console.log("=====================================");
				},
				onReady: (chartInstance: any) => {
					widgetRef.current = chartInstance;
					setStatus("Chart loaded successfully");
					setupDemoBrokerData(chartInstance);
				},
			});
		} catch (error) {
			console.error("Error initializing chart:", error);
			setStatus("Failed to initialize chart");
		}
	};

	return (
		<Box
			width='100%'
			flexDirection='column'
			gap={isMobile ? "16px" : "24px"}
		>
			{/* Chart Container */}
			<Box
				ref={chartContainerRef}
				width='100%'
				height={isMobile ? "400px" : "600px"}
				borderRadius='12px'
				overflow='hidden'
				background='#1a1a1a'
				alignItems='center'
				justifyContent='center'
			>
				<Text fontSize='18px'>{status}</Text>
			</Box>

			{/* Status Display */}
			<Box
				width='100%'
				background='linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
				p={isMobile ? "12px" : "16px"}
				borderRadius='12px'
				border='1px solid rgba(255, 255, 255, 0.06)'
				justifyContent='center'
			>
				<Text fontSize='14px' textAlign='center' opacity='0.6'>
					{status}
				</Text>
			</Box>
		</Box>
	);
};
