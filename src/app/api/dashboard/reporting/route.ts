import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Invoice from "@/lib/models/Invoice";
import Mission from "@/lib/models/Mission";
import Quote from "@/lib/models/Quote";
import Review from "@/lib/models/Review";
import TimeEntry from "@/lib/models/TimeEntry";
import User from "@/lib/models/User";
import AnalyticsEvent from "@/lib/models/AnalyticsEvent";
import { config } from "@/lib/config";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decoded = jwt.verify(token, config.auth.jwtSecret) as { userId: string };

    await connectDB();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    const portfolioProjects = Array.isArray(user.portfolio) ? user.portfolio.length : 0;
    const completionSignals = [
      Boolean(user.avatar),
      Boolean(user.bio),
      Array.isArray(user.professions) && user.professions.length > 0,
      Array.isArray(user.skills) && user.skills.length > 0,
      portfolioProjects > 0,
    ];
    const publicProfileCompletionPercent = Math.round(
      (completionSignals.filter(Boolean).length / completionSignals.length) * 100
    );

    const now = new Date();
    const thisMonthStart = startOfMonth(now);
    const lastMonthStart = addMonths(thisMonthStart, -1);

    const [paidInvoices, quotes, missions, timeEntries, reviews] = await Promise.all([
      Invoice.find({ userId: user._id, status: "Payée" }),
      Quote.find({ userId: user._id }),
      Mission.find({ userId: user._id }),
      TimeEntry.find({ userId: user._id }),
      Review.find({ reviewedId: user._id, reviewType: "client-to-freelance" }),
    ]);

    const analyticsSince = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const analyticsMatchBase = {
      siteKey: "public",
      createdAt: { $gte: analyticsSince },
    };

    const searchEnginesRegex = [
      /(^|\.)google\./i,
      /(^|\.)bing\.com$/i,
      /(^|\.)duckduckgo\.com$/i,
      /(^|\.)search\.yahoo\.com$/i,
      /(^|\.)yandex\./i,
      /(^|\.)ecosia\.org$/i,
    ];

    const searchEnginesPattern =
      "(^|\\.)google\\.|(^|\\.)bing\\.com$|(^|\\.)duckduckgo\\.com$|(^|\\.)search\\.yahoo\\.com$|(^|\\.)yandex\\.|(^|\\.)ecosia\\.org$";

    const socialHostsPattern =
      "(^|\\.)facebook\\.com$|(^|\\.)instagram\\.com$|(^|\\.)linkedin\\.com$|(^|\\.)t\\.co$|(^|\\.)twitter\\.com$|(^|\\.)x\\.com$|(^|\\.)pinterest\\.|(^|\\.)youtube\\.com$|(^|\\.)tiktok\\.com$";

    const sessionInsightsAgg = await AnalyticsEvent.aggregate([
      { $match: { ...analyticsMatchBase, event: "pageview" } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$sessionId",
          pageviews: { $sum: 1 },
          visitorId: { $first: "$visitorId" },
          createdAt: { $first: "$createdAt" },
          landingPath: { $first: "$path" },
          exitPath: { $last: "$path" },
          referrerHost: { $first: "$referrerHost" },
          utmSource: { $first: "$utmSource" },
          utmMedium: { $first: "$utmMedium" },
          utmCampaign: { $first: "$utmCampaign" },
        },
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                sessions: { $sum: 1 },
                pageviews: { $sum: "$pageviews" },
                bouncedSessions: {
                  $sum: { $cond: [{ $eq: ["$pageviews", 1] }, 1, 0] },
                },
              },
            },
          ],
          channels: [
            {
              $project: {
                pageviews: 1,
                utmMediumLower: { $toLower: { $ifNull: ["$utmMedium", ""] } },
                referrerHost: { $ifNull: ["$referrerHost", ""] },
              },
            },
            {
              $addFields: {
                channel: {
                  $switch: {
                    branches: [
                      {
                        case: {
                          $in: [
                            "$utmMediumLower",
                            [
                              "cpc",
                              "ppc",
                              "paid",
                              "paidsearch",
                              "sem",
                              "ads",
                              "paid-social",
                              "social-paid",
                            ],
                          ],
                        },
                        then: "Paid",
                      },
                      {
                        case: { $in: ["$utmMediumLower", ["email", "newsletter"]] },
                        then: "Email",
                      },
                      {
                        case: { $in: ["$utmMediumLower", ["social", "social-organic"]] },
                        then: "Social",
                      },
                      {
                        case: { $eq: ["$referrerHost", ""] },
                        then: "Direct",
                      },
                      {
                        case: {
                          $regexMatch: {
                            input: "$referrerHost",
                            regex: searchEnginesPattern,
                            options: "i",
                          },
                        },
                        then: "Organic",
                      },
                      {
                        case: {
                          $regexMatch: {
                            input: "$referrerHost",
                            regex: socialHostsPattern,
                            options: "i",
                          },
                        },
                        then: "Social",
                      },
                    ],
                    default: "Referral",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$channel",
                sessions: { $sum: 1 },
                pageviews: { $sum: "$pageviews" },
              },
            },
            { $sort: { sessions: -1 } },
          ],
          platforms: [
            {
              $project: {
                pageviews: 1,
                utmSource: { $ifNull: ["$utmSource", ""] },
                referrerHost: { $ifNull: ["$referrerHost", ""] },
              },
            },
            {
              $addFields: {
                platform: {
                  $switch: {
                    branches: [
                      { case: { $ne: ["$utmSource", ""] }, then: "$utmSource" },
                      { case: { $eq: ["$referrerHost", ""] }, then: "Direct" },
                    ],
                    default: "$referrerHost",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$platform",
                sessions: { $sum: 1 },
                pageviews: { $sum: "$pageviews" },
              },
            },
            { $sort: { sessions: -1 } },
            { $limit: 12 },
          ],
          daily: [
            {
              $project: {
                day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                visitorId: 1,
                pageviews: 1,
              },
            },
            {
              $group: {
                _id: "$day",
                sessions: { $sum: 1 },
                pageviews: { $sum: "$pageviews" },
                visitorsSet: { $addToSet: "$visitorId" },
              },
            },
            {
              $project: {
                _id: 0,
                date: "$_id",
                sessions: 1,
                pageviews: 1,
                visitors: { $size: "$visitorsSet" },
              },
            },
            { $sort: { date: 1 } },
          ],
          landingPages: [
            {
              $group: {
                _id: "$landingPath",
                sessions: { $sum: 1 },
                bouncedSessions: {
                  $sum: { $cond: [{ $eq: ["$pageviews", 1] }, 1, 0] },
                },
              },
            },
            { $sort: { sessions: -1 } },
            { $limit: 10 },
          ],
          exitPages: [
            { $group: { _id: "$exitPath", sessions: { $sum: 1 } } },
            { $sort: { sessions: -1 } },
            { $limit: 10 },
          ],
          campaigns: [
            {
              $group: {
                _id: {
                  utmSource: { $ifNull: ["$utmSource", "(none)"] },
                  utmMedium: { $ifNull: ["$utmMedium", "(none)"] },
                  utmCampaign: { $ifNull: ["$utmCampaign", "(none)"] },
                },
                sessions: { $sum: 1 },
                pageviews: { $sum: "$pageviews" },
              },
            },
            { $sort: { sessions: -1 } },
            { $limit: 10 },
          ],
        },
      },
    ]);

    const sessionInsights = sessionInsightsAgg?.[0] as
      | {
          overall?: { sessions: number; pageviews: number; bouncedSessions: number }[];
          channels?: { _id: string; sessions: number; pageviews: number }[];
          platforms?: { _id: string; sessions: number; pageviews: number }[];
          daily?: { date: string; sessions: number; pageviews: number; visitors: number }[];
          landingPages?: { _id: string; sessions: number; bouncedSessions: number }[];
          exitPages?: { _id: string; sessions: number }[];
          campaigns?: {
            _id: { utmSource: string; utmMedium: string; utmCampaign: string };
            sessions: number;
            pageviews: number;
          }[];
        }
      | undefined;

    const bouncedSessions = Number(sessionInsights?.overall?.[0]?.bouncedSessions ?? 0);
    const insightsSessions = Number(sessionInsights?.overall?.[0]?.sessions ?? 0);
    const bounceRatePct =
      insightsSessions > 0 ? Math.round((bouncedSessions / insightsSessions) * 100) : 0;

    const daily = (sessionInsights?.daily ?? []).slice(-30);

    const landingPages = (sessionInsights?.landingPages ?? []).map((row) => {
      const sessions = Number(row.sessions ?? 0);
      const bounces = Number(row.bouncedSessions ?? 0);
      const rate = sessions > 0 ? Math.round((bounces / sessions) * 100) : 0;
      return { path: row._id, sessions, bounceRatePct: rate };
    });

    const exitPages = (sessionInsights?.exitPages ?? []).map((row) => ({
      path: row._id,
      sessions: Number(row.sessions ?? 0),
    }));

    const campaigns = (sessionInsights?.campaigns ?? []).map((row) => ({
      utmSource: row._id.utmSource,
      utmMedium: row._id.utmMedium,
      utmCampaign: row._id.utmCampaign,
      sessions: Number(row.sessions ?? 0),
      pageviews: Number(row.pageviews ?? 0),
    }));

    const channels = (sessionInsights?.channels ?? []).map((row) => ({
      channel: row._id,
      sessions: Number(row.sessions ?? 0),
      pageviews: Number(row.pageviews ?? 0),
    }));

    const platforms = (sessionInsights?.platforms ?? []).map((row) => ({
      platform: row._id,
      sessions: Number(row.sessions ?? 0),
      pageviews: Number(row.pageviews ?? 0),
    }));

    const [
      pageviewsAgg,
      visitorsAgg,
      sessionsAgg,
      durationAgg,
      topPagesAgg,
      topReferrersAgg,
      organicPageviewsAgg,
      organicVisitorsAgg,
      organicSessionsAgg,
      organicDurationAgg,
      organicTopPagesAgg,
      organicEnginesAgg,
    ] = await Promise.all([
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "pageview" } },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "pageview" } },
        { $group: { _id: "$visitorId" } },
        { $count: "count" },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "pageview" } },
        { $group: { _id: "$sessionId" } },
        { $count: "count" },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "duration" } },
        { $group: { _id: null, sumDurationMs: { $sum: "$durationMs" } } },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "pageview" } },
        { $group: { _id: "$path", pageviews: { $sum: 1 } } },
        { $sort: { pageviews: -1 } },
        { $limit: 5 },
      ]),
      AnalyticsEvent.aggregate([
        { $match: { ...analyticsMatchBase, event: "pageview" } },
        {
          $group: {
            _id: { $ifNull: ["$referrerHost", "Direct"] },
            pageviews: { $sum: 1 },
          },
        },
        { $sort: { pageviews: -1 } },
        { $limit: 5 },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "pageview",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: null, count: { $sum: 1 } } },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "pageview",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: "$visitorId" } },
        { $count: "count" },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "pageview",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: "$sessionId" } },
        { $count: "count" },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "duration",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: null, sumDurationMs: { $sum: "$durationMs" } } },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "pageview",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: "$path", pageviews: { $sum: 1 } } },
        { $sort: { pageviews: -1 } },
        { $limit: 5 },
      ]),
      AnalyticsEvent.aggregate([
        {
          $match: {
            ...analyticsMatchBase,
            event: "pageview",
            referrerHost: { $in: searchEnginesRegex },
          },
        },
        { $group: { _id: "$referrerHost", pageviews: { $sum: 1 } } },
        { $sort: { pageviews: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const trafficPageviews = Number(pageviewsAgg?.[0]?.count ?? 0);
    const trafficVisitors = Number(visitorsAgg?.[0]?.count ?? 0);
    const trafficSessions = Number(sessionsAgg?.[0]?.count ?? 0);
    const totalDurationMs = Number(durationAgg?.[0]?.sumDurationMs ?? 0);

    const pagesPerSession = trafficSessions > 0 ? trafficPageviews / trafficSessions : 0;
    const avgSessionDurationSec =
      trafficSessions > 0 ? Math.round(totalDurationMs / 1000 / trafficSessions) : 0;

    const topPages = topPagesAgg.map((row: { _id: string; pageviews: number }) => ({
      path: row._id,
      pageviews: row.pageviews,
    }));

    const topReferrers = topReferrersAgg.map((row: { _id: string; pageviews: number }) => ({
      referrer: row._id,
      pageviews: row.pageviews,
    }));

    const organicPageviews = Number(organicPageviewsAgg?.[0]?.count ?? 0);
    const organicVisitors = Number(organicVisitorsAgg?.[0]?.count ?? 0);
    const organicSessions = Number(organicSessionsAgg?.[0]?.count ?? 0);
    const organicTotalDurationMs = Number(organicDurationAgg?.[0]?.sumDurationMs ?? 0);
    const organicPagesPerSession = organicSessions > 0 ? organicPageviews / organicSessions : 0;
    const organicAvgSessionDurationSec =
      organicSessions > 0 ? Math.round(organicTotalDurationMs / 1000 / organicSessions) : 0;

    const organicTopPages = organicTopPagesAgg.map((row: { _id: string; pageviews: number }) => ({
      path: row._id,
      pageviews: row.pageviews,
    }));

    const organicEngines = organicEnginesAgg.map((row: { _id: string; pageviews: number }) => ({
      engine: row._id,
      pageviews: row.pageviews,
    }));

    const paidThisMonth = paidInvoices.filter(
      (inv) => inv.paidDate && new Date(inv.paidDate) >= thisMonthStart
    );
    const monthlyRevenue = paidThisMonth.reduce((sum, inv) => sum + (inv.total || 0), 0);

    const monthlyTarget = Number(user.monthlyTarget) || 0;
    const objectivePercent =
      monthlyTarget > 0 ? Math.min(100, Math.round((monthlyRevenue / monthlyTarget) * 100)) : 0;

    const completedThisMonth = missions.filter(
      (m) => m.status === "Terminé" && m.updatedAt && new Date(m.updatedAt) >= thisMonthStart
    ).length;
    const completedLastMonth = missions.filter(
      (m) =>
        m.status === "Terminé" &&
        m.updatedAt &&
        new Date(m.updatedAt) >= lastMonthStart &&
        new Date(m.updatedAt) < thisMonthStart
    ).length;

    const billableThisMonthHours = timeEntries
      .filter((t) => t.billable && t.date && new Date(t.date) >= thisMonthStart)
      .reduce((sum, t) => sum + (t.hours || 0), 0);

    const billableLastMonthHours = timeEntries
      .filter(
        (t) => t.billable && t.date && new Date(t.date) >= lastMonthStart && new Date(t.date) < thisMonthStart
      )
      .reduce((sum, t) => sum + (t.hours || 0), 0);

    const paidInvoicesWithDelay = paidInvoices.filter((inv) => inv.paidDate && inv.issueDate);
    const avgPaymentDelay =
      paidInvoicesWithDelay.length > 0
        ? Math.round(
            paidInvoicesWithDelay.reduce((sum, inv) => {
              const delayDays =
                (new Date(inv.paidDate!).getTime() - new Date(inv.issueDate).getTime()) /
                (1000 * 60 * 60 * 24);
              return sum + delayDays;
            }, 0) / paidInvoicesWithDelay.length
          )
        : 0;

    const quotesConsidered = quotes.filter((q) => q.status !== "Brouillon");
    const conversionRate =
      quotesConsidered.length > 0
        ? Math.round((quotesConsidered.filter((q) => q.status === "Accepté").length / quotesConsidered.length) * 100)
        : 0;

    const reviewRatings = reviews.map((r) => Number(r.rating) || 0).filter((n) => n > 0);
    const clientSatisfaction =
      reviewRatings.length > 0
        ? Math.round((reviewRatings.reduce((sum, r) => sum + r, 0) / reviewRatings.length) * 10) / 10
        : 0;

    const revenueByClient = new Map<string, number>();
    const invoicesByClient = new Map<string, number>();
    for (const inv of paidInvoices) {
      const name = inv.clientName || "Client";
      revenueByClient.set(name, (revenueByClient.get(name) || 0) + (inv.total || 0));
      invoicesByClient.set(name, (invoicesByClient.get(name) || 0) + 1);
    }

    const uniquePaidClients = Array.from(invoicesByClient.keys());
    const retainedClients = uniquePaidClients.filter((name) => (invoicesByClient.get(name) || 0) >= 2).length;
    const retentionRate =
      uniquePaidClients.length > 0 ? Math.round((retainedClients / uniquePaidClients.length) * 100) : 0;

    const topClients = Array.from(revenueByClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, revenue]) => ({
        name,
        revenue,
        projects: invoicesByClient.get(name) || 0,
      }));

    const monthSeries = Array.from({ length: 6 }).map((_, i) => {
      const monthStart = addMonths(thisMonthStart, -i);
      const nextMonthStart = addMonths(thisMonthStart, -i + 1);
      const amount = paidInvoices
        .filter((inv) => inv.paidDate && new Date(inv.paidDate) >= monthStart && new Date(inv.paidDate) < nextMonthStart)
        .reduce((sum, inv) => sum + (inv.total || 0), 0);
      return {
        month: MONTHS_FR[monthStart.getMonth()],
        amount,
      };
    });

    const maxMonthRevenue = Math.max(1, ...monthSeries.map((m) => m.amount));
    const revenueByMonth = monthSeries.map((m) => ({
      month: m.month,
      amount: m.amount,
      percent: Math.round((m.amount / maxMonthRevenue) * 100),
    }));

    const revenueTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const colorCycle = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500"];
    const revenueByType = Array.from(revenueByClient.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([type, amount], index) => ({
        type,
        percent: revenueTotal > 0 ? Math.round((amount / revenueTotal) * 100) : 0,
        color: colorCycle[index % colorCycle.length],
      }))
      .filter((x) => x.percent > 0);

    const reportingData = {
      objective: {
        current: monthlyRevenue,
        target: monthlyTarget,
        percent: objectivePercent,
      },
      website: {
        portfolioProjects,
        publicProfileCompletionPercent,
        analytics: {
          rangeDays: 30,
          pageviews: trafficPageviews,
          visitors: trafficVisitors,
          sessions: trafficSessions,
          pagesPerSession: Math.round(pagesPerSession * 100) / 100,
          avgSessionDurationSec,
          topPages,
          topReferrers,
          details: {
            daily,
            bounceRatePct,
            landingPages,
            exitPages,
            campaigns,
            channels,
            platforms,
          },
        },
        seo: {
          rangeDays: 30,
          organicPageviews,
          organicVisitors,
          organicSessions,
          organicPagesPerSession: Math.round(organicPagesPerSession * 100) / 100,
          organicAvgSessionDurationSec,
          topLandingPages: organicTopPages,
          engines: organicEngines,
        },
      },
      stats: {
        projectsCompleted: completedThisMonth,
        projectsGrowth: completedThisMonth - completedLastMonth,
        hoursBilled: Math.round(billableThisMonthHours),
        hoursGrowth: Math.round(billableThisMonthHours - billableLastMonthHours),
        hourlyRate: Number(user.hourlyRate) || 0,
      },
      revenueByMonth,
      revenueByType,
      topClients,
      performance: {
        conversionRate,
        avgPaymentDelay,
        clientSatisfaction,
        retentionRate,
      },
    };

    return NextResponse.json(reportingData);
  } catch (error) {
    console.error("Erreur API reporting:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
