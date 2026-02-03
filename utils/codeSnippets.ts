export const SQL_SNIPPETS = [
    `-- ANALYTICS: Monthly Recurring Revenue
-- DB: Sales_Data_Warehouse

WITH MonthlyStats AS (
    SELECT 
        FORMAT(OrderDate, 'yyyy-MM') AS Mth,
        SUM(TotalAmount) AS Revenue,
        COUNT(OrderId) AS TxCount
    FROM Sales.Orders WITH(NOLOCK)
    WHERE Status = 'Completed'
    GROUP BY FORMAT(OrderDate, 'yyyy-MM')
),
GrowthMetrics AS (
    SELECT 
        Mth,
        Revenue,
        LAG(Revenue) OVER (ORDER BY Mth) AS PrevRevenue
    FROM MonthlyStats
)
SELECT 
    Mth,
    Revenue,
    (Revenue - PrevRevenue) * 100.0 / NULLIF(PrevRevenue, 0) AS GrowthPct
FROM GrowthMetrics
ORDER BY Mth DESC;`,

    `-- SECURITY: Audit Log Analysis
-- Check for suspicious login patterns

SELECT 
    u.UserName,
    u.Region,
    COUNT(l.LoginId) as Failures,
    MAX(l.AttemptDate) as LastAttempt
FROM Security.Users u
JOIN Security.LoginAttempts l ON u.Id = l.UserId
WHERE l.Success = 0 
    AND l.AttemptDate > DATEADD(HOUR, -24, GETDATE())
GROUP BY u.UserName, u.Region
HAVING COUNT(l.LoginId) > 5
ORDER BY Failures DESC;`,

    `-- INVENTORY: Stock Level Optimization
-- Predict reorder points

SELECT 
    p.ProductName,
    p.StockLevel,
    AVG(s.Quantity) as DailySales,
    (AVG(s.Quantity) * 14) as LeadTimeDemand,
    CASE 
        WHEN p.StockLevel < (AVG(s.Quantity) * 14) 
        THEN 'REORDER_URGENT'
        ELSE 'OK'
    END as Status
FROM Warehouse.Products p
JOIN Warehouse.Sales s ON p.Id = s.ProductId
GROUP BY p.ProductName, p.StockLevel;`
];

export const CSHARP_SNIPPETS = [
    `// MIDDLEWARE: Request Timing
// Measure API latency

using System.Diagnostics;
using Microsoft.AspNetCore.Http;

public class RequestTimingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger _logger;

    public RequestTimingMiddleware(RequestDelegate next, ILogger log)
    {
        _next = next;
        _logger = log;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        try 
        {
            await _next(context);
        }
        finally 
        {
            sw.Stop();
            if (sw.ElapsedMilliseconds > 500)
            {
                _logger.LogWarning(
                    "Slow Req: {Path} {Ms}ms",
                    context.Request.Path, 
                    sw.ElapsedMilliseconds
                );
            }
        }
    }
}`,

    `// SERVICE: Event Bus Provider
// Solace PubSub+ Implementation

using SolaceSystems.Solclient.Messaging;

public class SolaceProducer : IMessageProducer
{
    private ISession _session;

    public void Connect()
    {
        var props = new SessionProperties 
        {
            Host = "tcps://prod-broker:55443",
            VPNName = "default",
            UserName = "producer_svc",
            Password = "secure_token"
        };

        _session = _context.CreateSession(props, null, null);
        _session.Connect();
    }

    public void Publish(string topic, string payload)
    {
        // C# 8.0 using declaration reduces nesting
        using var msg = _context.CreateMessage();

        msg.Destination = Topic.Create(topic);
        msg.BinaryAttachment = Encoding.UTF8.GetBytes(payload);
        msg.DeliveryMode = MessageDeliveryMode.Persistent;
            
        _session.Send(msg);
    }
}`
];

export const TS_SNIPPETS = [
    `/**
 * HOOK: useWebSocket
 * Manages reliable socket connections
 */
import { useState, useEffect, useRef } from 'react';

interface SocketState<T> {
    lastMessage: T | null;
    isConnected: boolean;
}

export function useWebSocket<T>(url: string) {
    const [state, setState] = useState<SocketState<T>>({
        lastMessage: null,
        isConnected: false
    });
  
    const socketRef = useRef<WebSocket | null>(null);
    const retryCount = useRef(0);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(url);
      
            ws.onopen = () => {
                setState(s => ({ ...s, isConnected: true }));
                retryCount.current = 0;
            };

            ws.onmessage = (evt) => {
                try {
                    const data = JSON.parse(evt.data);
                    setState(s => ({ ...s, lastMessage: data }));
                } catch (e) {
                    console.error('Parse Error', e);
                }
            };

            ws.onclose = () => {
                setState(s => ({ ...s, isConnected: false }));
                // Exponential backoff
                const timeout = Math.min(
                    1000 * (2 ** retryCount.current), 
                    30000
                );
                retryCount.current++;
                setTimeout(connect, timeout);
            };

            socketRef.current = ws;
        };

        connect();
        return () => socketRef.current?.close();
    }, [url]);

    return state;
}`,

    `/**
 * UTIL: Data Transformer
 * Normalizes API responses for UI
 */
 
interface RawUser {
    id: number;
    first_name: string;
    last_name: string;
    role_id: number;
}

interface User {
    id: string;
    fullName: string;
    isAdmin: boolean;
}

export const transformUser = (raw: RawUser): User => {
    return {
        id: raw.id.toString(),
        fullName: \`\${raw.first_name} \${raw.last_name}\`,
        isAdmin: raw.role_id === 1 || raw.role_id === 99
    };
};

export const filterActiveAdmins = (users: RawUser[]): User[] => {
    return users
        .map(transformUser)
        .filter(u => u.isAdmin);
};`
];