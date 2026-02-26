// Analytics / Charts page for System Management
// Shows total revenue, total orders and simple sales overview based on orders data

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Col,
  Empty,
  List,
  Row,
  Skeleton,
  Statistic,

  Radio,
} from "antd";
import {
  LineChartOutlined,
  ShoppingCartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";

import type { Order } from "../../../api/orderApi";
import {
  formatVND,
  getAllOrdersService,
} from "../services/orderservicesSystems";

type PeriodKey = "day" | "week" | "month";

type PeriodSummary = {
  periodKey: string;
  label: string;
  totalAmount: number;
  orderCount: number;
};

type CustomerSummary = {
  name: string;
  totalAmount: number;
  orderCount: number;
};

type ProductSlice = {
  productId: string;
  name: string;
  amount: number;
  percent: number;
  color: string;
};

function parseOrderDate(order: any): Date | null {
  const rawDate: string | undefined = order?.createdAt;
  if (!rawDate) return null;
  const d = new Date(rawDate);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getWeekKey(date: Date): string {
  // ISO week number
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((+d - +yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function buildLabelFromKey(key: string, period: PeriodKey): string {
  if (key === "Unknown") return "Unknown";

  if (period === "day") {
    // YYYY-MM-DD -> MM-DD
    return key.slice(5);
  }

  if (period === "week") {
    const [year, weekPart] = key.split("-W");
    const week = Number(weekPart || 0);
    return `Tuần ${week} / ${year}`;
  }

  // month
  const [year, month] = key.split("-");
  return `${month}/${year}`;
}

function getUserDisplayName(order: any): string {
  return (
    order?.users?.name ??
    order?.users?.fullName ??
    order?.users?.username ??
    `User #${order?.user_ID ?? "-"}`
  );
}

const ChartsInformation: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodKey>("day");

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

  const periodSummaries: PeriodSummary[] = useMemo(() => {
    if (!orders.length) return [];

    const map = new Map<string, { totalAmount: number; orderCount: number }>();

    orders.forEach((o: any) => {
      const date = parseOrderDate(o);
      const key: string = (() => {
        if (!date) return "Unknown";
        if (period === "day") {
          return date.toISOString().slice(0, 10);
        }
        if (period === "week") {
          return getWeekKey(date);
        }
        return getMonthKey(date);
      })();

      if (!map.has(key)) {
        map.set(key, { totalAmount: 0, orderCount: 0 });
      }

      const entry = map.get(key)!;
      entry.totalAmount += Number(o.total_Amount || 0);
      entry.orderCount += 1;
    });

    const sorted = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );

    const last = sorted.slice(-12); // show last 12 periods if many

    return last.map(([periodKey, value]) => ({
      periodKey,
      label: buildLabelFromKey(periodKey, period),
      totalAmount: value.totalAmount,
      orderCount: value.orderCount,
    }));
  }, [orders, period]);

  const maxPeriodAmount = useMemo(
    () =>
      periodSummaries.reduce(
        (max, d) => (d.totalAmount > max ? d.totalAmount : max),
        0
      ),
    [periodSummaries]
  );

  const lineChartPoints = useMemo(() => {
    if (!periodSummaries.length || !maxPeriodAmount) return "";
    const n = periodSummaries.length;

    return periodSummaries
      .map((d, idx) => {
        const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
        const ratio = d.totalAmount / maxPeriodAmount;
        const y = 100 - ratio * 80 - 10; // top/bottom padding
        return `${x},${y}`;
      })
      .join(" ");
  }, [periodSummaries, maxPeriodAmount]);

  const highestPeriod = useMemo(() => {
    if (!periodSummaries.length) return null;
    return periodSummaries.reduce<PeriodSummary | null>((current, d) => {
      if (!current) return d;
      return d.totalAmount > current.totalAmount ? d : current;
    }, null);
  }, [periodSummaries]);

  const lowestPeriod = useMemo(() => {
    if (!periodSummaries.length) return null;
    // bỏ qua những mốc có doanh thu bằng 0 để tránh gây hiểu nhầm
    const nonZero = periodSummaries.filter((d) => d.totalAmount > 0);
    if (!nonZero.length) return null;
    return nonZero.reduce<PeriodSummary | null>((current, d) => {
      if (!current) return d;
      return d.totalAmount < current.totalAmount ? d : current;
    }, null);
  }, [periodSummaries]);

  const periodLabel = useMemo(() => {
    if (period === "day") return "ngày";
    if (period === "week") return "tuần";
    return "tháng";
  }, [period]);

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

  const topProductSlices: ProductSlice[] = useMemo(() => {
    if (!orders.length) return [];

    const productMap = new Map<
      string,
      { name: string; amount: number }
    >();

    orders.forEach((order: any) => {
      const rawItems =
        (order?.orderItems as any[]) ||
        (order?.orderitems as any[]) ||
        (order?.items as any[]) ||
        [];

      rawItems.forEach((item: any) => {
        const id =
          String(item?.product_ID ?? item?.productId ?? item?.product?.product_ID ?? "");
        if (!id) return;

        const name =
          item?.product?.name ?? item?.name ?? `Sản phẩm #${id}`;

        const quantity = Number(item?.quantity ?? 1);
        const price = Number(item?.price ?? item?.product?.price ?? 0);
        const lineAmount = quantity * price;

        if (!productMap.has(id)) {
          productMap.set(id, { name, amount: 0 });
        }
        const entry = productMap.get(id)!;
        entry.amount += lineAmount;
      });
    });

    const entries = Array.from(productMap.entries())
      .map(([productId, value]) => ({
        productId,
        name: value.name,
        amount: value.amount,
      }))
      .filter((p) => p.amount > 0)
      .sort((a, b) => b.amount - a.amount);

    if (!entries.length) return [];

    const top = entries.slice(0, 4);
    const others = entries.slice(4);

    const totalAmount =
      entries.reduce((sum, p) => sum + p.amount, 0) || 1;

    const baseSlices: ProductSlice[] = top.map((p) => ({
      productId: p.productId,
      name: p.name,
      amount: p.amount,
      percent: (p.amount / totalAmount) * 100,
      color: "",
    }));

    if (others.length) {
      const othersAmount = others.reduce(
        (sum, p) => sum + p.amount,
        0
      );
      baseSlices.push({
        productId: "others",
        name: "Khác",
        amount: othersAmount,
        percent: (othersAmount / totalAmount) * 100,
        color: "",
      });
    }

    const colors = [
      "#3b82f6",
      "#22c55e",
      "#f97316",
      "#a855f7",
      "#6b7280",
    ];

    return baseSlices.map((slice, idx) => ({
      ...slice,
      color: colors[idx % colors.length],
    }));
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
                <LineChartOutlined /> Sales overview theo {periodLabel}
              </span>
            }
            extra={
              <Radio.Group
                size="small"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <Radio.Button value="day">Ngày</Radio.Button>
                <Radio.Button value="week">Tuần</Radio.Button>
                <Radio.Button value="month">Tháng</Radio.Button>
              </Radio.Group>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : periodSummaries.length === 0 ? (
              <Empty description="Chưa có dữ liệu đơn hàng" />
            ) : (
              <div className="charts-dashboard__chart">
                <div className="charts-dashboard__chart-header">
                  <span>Tổng doanh thu theo {periodLabel} (VND)</span>
                </div>

                <div className="charts-dashboard__chart-body">
                  <svg
                    className="charts-dashboard__chart-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    {periodSummaries.map((d, idx) => {
                      if (!maxPeriodAmount) return null;
                      const n = periodSummaries.length;
                      const xCenter = n === 1 ? 50 : (idx / (n - 1)) * 100;
                      const ratio = d.totalAmount / maxPeriodAmount;
                      const barHeight = ratio * 80;
                      const barWidth = n === 1 ? 6 : 80 / n;
                      const y = 100 - barHeight - 10;
                      const x = xCenter - barWidth / 2;

                      return (
                        <g key={`bar-${d.periodKey}`}>
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            rx={1.8}
                            fill="url(#salesBarGradient)"
                          >
                            <title>
                              {`${d.label}: ${formatVND(d.totalAmount)} (${d.orderCount} đơn)`}
                            </title>
                          </rect>
                        </g>
                      );
                    })}

                    {lineChartPoints && (
                      <>
                        <defs>
                          <linearGradient
                            id="salesBarGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.95" />
                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.75" />
                          </linearGradient>
                          <linearGradient
                            id="salesLineGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#166534" stopOpacity="0.4" />
                          </linearGradient>
                        </defs>
                        <polyline
                          points={lineChartPoints}
                          fill="none"
                          stroke="url(#salesLineGradient)"
                          strokeWidth={2}
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </>
                    )}

                    {periodSummaries.map((d, idx) => {
                      if (!maxPeriodAmount) return null;
                      const n = periodSummaries.length;
                      const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
                      const ratio = d.totalAmount / maxPeriodAmount;
                      const y = 100 - ratio * 80 - 10;
                      return (
                        <g key={`point-${d.periodKey}`}>
                          <circle
                            cx={x}
                            cy={y}
                            r={1.8}
                            fill="#ecfdf5"
                            stroke="#16a34a"
                            strokeWidth={0.7}
                          >
                            <title>
                              {`${d.label}: ${formatVND(d.totalAmount)} (${d.orderCount} đơn)`}
                            </title>
                          </circle>
                        </g>
                      );
                    })}
                  </svg>
                  <div className="charts-dashboard__chart-xlabels">
                    {periodSummaries.map((d, idx) => {
                      const n = periodSummaries.length;
                      const x = n === 1 ? 50 : (idx / (n - 1)) * 100;
                      return (
                        <span
                          key={d.periodKey}
                          className="charts-dashboard__chart-label"
                          style={{ left: `${x}%` }}
                        >
                          {d.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="charts-dashboard__extremes">
                  {highestPeriod && (
                    <div className="charts-dashboard__extreme charts-dashboard__extreme--high">
                      <span>
                        Mốc cao nhất: <strong>{highestPeriod.label}</strong>
                      </span>
                      <span>
                        {formatVND(highestPeriod.totalAmount)} (
                        {highestPeriod.orderCount} đơn)
                      </span>
                    </div>
                  )}
                  {lowestPeriod && (
                    <div className="charts-dashboard__extreme charts-dashboard__extreme--low">
                      <span>
                        Mốc thấp nhất: <strong>{lowestPeriod.label}</strong>
                      </span>
                      <span>
                        {formatVND(lowestPeriod.totalAmount)} (
                        {lowestPeriod.orderCount} đơn)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            className="system-manager__panel charts-dashboard__card charts-dashboard__card--side"
            title={
              <span className="system-manager__toolbar-label">
                <PieChartOutlined /> Top sản phẩm
              </span>
            }
          >
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : !topProductSlices.length ? (
              <Empty description="Chưa có dữ liệu sản phẩm (thiếu order items)" />
            ) : (
              <div className="charts-dashboard__pie-wrapper">
                <div className="charts-dashboard__pie">
                  <svg viewBox="0 0 120 120">
                    {(() => {
                      const radius = 45;
                      const center = 60;
                      const circumference = 2 * Math.PI * radius;
                      let offset = 0;

                      return topProductSlices.map((slice) => {
                        const value =
                          (slice.percent / 100) * circumference;
                        const circle = (
                          <circle
                            key={slice.productId}
                            cx={center}
                            cy={center}
                            r={radius}
                            fill="transparent"
                            stroke={slice.color}
                            strokeWidth={12}
                            strokeDasharray={`${value} ${
                              circumference - value
                            }`}
                            strokeDashoffset={
                              -offset - circumference / 4
                            }
                          />
                        );
                        offset += value;
                        return circle;
                      });
                    })()}
                    <circle
                      cx={60}
                      cy={60}
                      r={30}
                      fill="#f9fafb"
                      stroke="#e5e7eb"
                      strokeWidth={1}
                    />
                    <text
                      x={60}
                      y={54}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6b7280"
                    >
                      Tổng doanh thu
                    </text>
                    <text
                      x={60}
                      y={69}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="bold"
                      fill="#111827"
                    >
                      {formatVND(
                        topProductSlices.reduce(
                          (sum, s) => sum + s.amount,
                          0
                        )
                      )}
                    </text>
                  </svg>
                </div>
                <div className="charts-dashboard__pie-legend">
                  <List
                    size="small"
                    dataSource={topProductSlices}
                    renderItem={(item) => (
                      <List.Item className="charts-dashboard__pie-item">
                        <div className="charts-dashboard__pie-dot-wrapper">
                          <span
                            className="charts-dashboard__pie-dot"
                            style={{ backgroundColor: item.color }}
                          />
                        </div>
                        <div className="charts-dashboard__pie-text">
                          <div className="charts-dashboard__pie-name">
                            {item.name}
                          </div>
                          <div className="charts-dashboard__pie-meta">
                            <span>
                              {formatVND(item.amount)} (
                              {item.percent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ChartsInformation;

