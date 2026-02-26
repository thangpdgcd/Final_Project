// Simple daily sales overview + top customers, restored version

import React, { useEffect, useMemo, useState } from "react";
import { Card, Col, Empty, List, Row, Skeleton, Statistic, Tag } from "antd";
import {
  LineChartOutlined,
  ShoppingCartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

import type { Order } from "../../../api/orderApi";
import { formatVND, getAllOrdersService } from "../services/orderservicesSystems";

type DailySummary = {
  dateKey: string;
  label: string;
  totalAmount: number;
  orderCount: number;
};

type CustomerSummary = {
  name: string;
  totalAmount: number;
  orderCount: number;
};

function getUserDisplayName(order: any): string {
  return (
    order?.users?.name ??
    order?.users?.fullName ??
    order?.users?.username ??
    `User #${order?.user_ID ?? "-"}`
  );
}

const DashboardCharts: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getAllOrdersService();
        setOrders(data || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total_Amount || 0), 0),
    [orders]
  );

  const totalOrders = orders.length;

  const averageOrderValue = useMemo(
    () => (totalOrders ? totalRevenue / totalOrders : 0),
    [totalRevenue, totalOrders]
  );

  const dailySummaries: DailySummary[] = useMemo(() => {
    if (!orders.length) return [];

    const map = new Map<string, { totalAmount: number; orderCount: number }>();

    orders.forEach((o: any) => {
      const rawDate: string | undefined = o?.createdAt;
      const dateKey = rawDate ? String(rawDate).slice(0, 10) : "Unknown";

      if (!map.has(dateKey)) {
        map.set(dateKey, { totalAmount: 0, orderCount: 0 });
      }

      const entry = map.get(dateKey)!;
      entry.totalAmount += Number(o.total_Amount || 0);
      entry.orderCount += 1;
    });

    const sorted = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const last = sorted.slice(-12); // show last 12 days if many

    return last.map(([dateKey, value]) => ({
      dateKey,
      label: dateKey === "Unknown" ? "Unknown" : dateKey.slice(5), // MM-DD
      totalAmount: value.totalAmount,
      orderCount: value.orderCount,
    }));
  }, [orders]);

  const maxDailyAmount = useMemo(
    () =>
      dailySummaries.reduce(
        (max, d) => (d.totalAmount > max ? d.totalAmount : max),
        0
      ),
    [dailySummaries]
  );

  const lineChartPoints = useMemo(() => {
    if (!dailySummaries.length || !maxDailyAmount) return "";
    const n = dailySummaries.length;

    return dailySummaries
      .map((d, idx) => {
        const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
        const ratio = d.totalAmount / maxDailyAmount;
        const y = 100 - ratio * 80 - 10; // top/bottom padding
        return `${x},${y}`;
      })
      .join(" ");
  }, [dailySummaries, maxDailyAmount]);

  const topCustomers: CustomerSummary[] = useMemo(() => {
    if (!orders.length) return [];

    const map = new Map<string, { totalAmount: number; orderCount: number }>();

    orders.forEach((o: any) => {
      const name = getUserDisplayName(o);
      if (!map.has(name)) {
        map.set(name, { totalAmount: 0, orderCount: 0 });
      }
      const entry = map.get(name)!;
      entry.totalAmount += Number(o.total_Amount || 0);
      entry.orderCount += 1;
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        totalAmount: value.totalAmount,
        orderCount: value.orderCount,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 5);
  }, [orders]);

  return (
    <div className="system-manager charts-dashboard">
      <h2 className="system-manager__title">
        <LineChartOutlined /> System - Sales Analytics
      </h2>

      <Row gutter={16} className="system-manager__stats">
        <Col xs={24} sm={12} lg={8}>
          <Card className="system-manager__stat-card system-manager__stat-card--primary">
            <Statistic
              title="Tổng doanh thu"
              value={totalRevenue}
              formatter={(v) => formatVND(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="system-manager__stat-card system-manager__stat-card--light">
            <Statistic
              title="Tổng số đơn hàng"
              value={totalOrders}
              prefix={<ShoppingCartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="system-manager__stat-card system-manager__stat-card--light">
            <Statistic
              title="Giá trị trung bình / đơn"
              value={averageOrderValue}
              formatter={(v) => formatVND(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} className="charts-dashboard__grid">
        <Col xs={24} lg={16}>
          <Card
            className="system-manager__panel charts-dashboard__card charts-dashboard__card--main"
            title={
              <span className="system-manager__toolbar-label">
                <LineChartOutlined /> Sales overview theo ngày
              </span>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : dailySummaries.length === 0 ? (
              <Empty description="Chưa có dữ liệu đơn hàng" />
            ) : (
              <div className="charts-dashboard__chart">
                <div className="charts-dashboard__chart-header">
                  <span>Tổng doanh thu theo ngày (VND)</span>
                </div>

                <div className="charts-dashboard__chart-body">
                  <svg
                    className="charts-dashboard__chart-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {/* background area */}
                    {lineChartPoints && (
                      <>
                        <defs>
                          <linearGradient
                            id="salesLineGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`M 0 100 L ${lineChartPoints} L 100 100 Z`}
                          fill="url(#salesLineGradient)"
                          stroke="none"
                        />
                        <polyline
                          points={lineChartPoints}
                          fill="none"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </>
                    )}
                    {dailySummaries.map((d, idx) => {
                      if (!maxDailyAmount) return null;
                      const n = dailySummaries.length;
                      const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
                      const ratio = d.totalAmount / maxDailyAmount;
                      const y = 100 - ratio * 80 - 10;
                      return (
                        <g key={d.dateKey}>
                          <circle
                            cx={x}
                            cy={y}
                            r={1.6}
                            fill="#f9fafb"
                            stroke="#4f46e5"
                            strokeWidth={0.7}
                          >
                            <title>
                              {`${d.dateKey}: ${formatVND(
                                d.totalAmount
                              )} (${d.orderCount} đơn)`}
                            </title>
                          </circle>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="charts-dashboard__chart-xlabels">
                    {dailySummaries.map((d, idx) => {
                      const n = dailySummaries.length;
                      const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
                      return (
                        <span
                          key={d.dateKey}
                          className="charts-dashboard__chart-label"
                          style={{ left: `${x}%` }}
                        >
                          {d.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="system-manager__panel charts-dashboard__card"
            title={
              <span className="system-manager__toolbar-label">
                <PieChartOutlined /> Top khách hàng theo doanh thu
              </span>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : topCustomers.length === 0 ? (
              <Empty description="Chưa có dữ liệu khách hàng" />
            ) : (
              <List
                dataSource={topCustomers}
                renderItem={(item) => (
                  <List.Item className="charts-dashboard__customer-item">
                    <List.Item.Meta
                      title={<span>{item.name}</span>}
                      description={
                        <span>
                          {formatVND(item.totalAmount)}{" "}
                          <Tag color="blue" style={{ borderRadius: 999 }}>
                            {item.orderCount} đơn
                          </Tag>
                        </span>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardCharts;

