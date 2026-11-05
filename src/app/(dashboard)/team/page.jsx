"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/services/api";
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import { RANK_NAMES } from "@/lib/constants";
import {
  Users,
  Copy,
  Check,
  Share2,
  GitFork,
  Layers,
  Search,
  Filter,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

// Commission rates per level as per contract
const LEVEL_COMMISSIONS = {
  L1: "8.00%",
  L2: "5.00%",
  L3: "3.00%",
  L4: "2.00%",
  L5: "1.00%",
  L6: "0.20%",
  L7: "0.20%",
  L8: "0.20%",
  L9: "0.20%",
  L10: "0.20%",
};

// Recursive Tree Node Component
function TreeNode({ node, isRoot = false }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative flex flex-col items-center p-3 rounded-xl border transition-all ${
          isRoot
            ? "bg-blue-50/80 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800 shadow-sm"
            : "bg-white border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 hover:border-blue-400"
        } min-w-[170px] text-center`}
      >
        <div className="flex items-center gap-1.5 justify-center mb-1">
          <Badge variant={isRoot ? "info" : "default"} size="sm">
            {node.current_rank || "SPP"}
          </Badge>
          <span className="text-xs font-bold text-gray-900 dark:text-white">
            @{node.username}
          </span>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-zinc-400">
          Code: <span className="font-mono font-medium">{node.referral_code}</span>
        </p>

        {node.direct_count > 0 && (
          <div className="mt-2 flex items-center justify-center gap-1">
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">
              Direct: {node.direct_count}
            </span>
            {hasChildren && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-gray-400 hover:text-blue-500 p-0.5 rounded"
              >
                {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}
      </div>

      {hasChildren && expanded && (
        <div className="flex flex-col items-center w-full">
          {/* Connector line down */}
          <div className="w-0.5 h-5 bg-gray-300 dark:bg-zinc-700"></div>

          {/* Horizontal line over children */}
          {node.children.length > 1 && (
            <div className="h-0.5 bg-gray-300 dark:bg-zinc-700 w-full max-w-[80%]"></div>
          )}

          {/* Children container */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TeamPage() {
  const { isAuthenticated, user, isInitialized, initializeAuth } = useAuthStore();
  const [summary, setSummary] = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [downlines, setDownlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("members"); // "members" | "tree" | "levels"

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, treeRes, downRes] = await Promise.all([
          api.get("/api/auth/referrals/summary/"),
          api.get("/api/auth/referrals/tree/?depth=3"),
          api.get("/api/auth/referrals/downlines/"),
        ]);
        setSummary(sumRes);
        setTreeData(treeRes);
        setDownlines(downRes?.results || []);
      } catch (err) {
        console.error("Failed to load team data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isAuthenticated]);

  const copyReferralLink = () => {
    if (!summary?.referral_link) return;
    navigator.clipboard.writeText(summary.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const copyCode = () => {
    if (!summary?.referral_code) return;
    navigator.clipboard.writeText(summary.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Card className="p-8">
          <Users className="mx-auto h-12 w-12 text-blue-500 mb-3" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Authentication Required</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
            Please log in or register to view your 10-tier referral team network and genealogy tree.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login">
              <Button>Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Filter members
  const filteredMembers = downlines.filter((m) => {
    const matchesLevel = selectedLevel === "all" || String(m.level) === String(selectedLevel);
    const matchesSearch =
      !searchQuery ||
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.referral_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${m.first_name || ""} ${m.last_name || ""}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              My Team & Referral Network
            </h1>
            <Badge variant="purple" size="md">
              10-Tier MLM
            </Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Monitor your 10-level affiliate network, tree structure, and commission breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <Button size="sm" onClick={copyReferralLink} className="gap-1.5">
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
            {copied ? "Link Copied!" : "Share Referral Link"}
          </Button>
        </div>
      </div>

      {/* Referral Link & Code Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
                <Shield className="h-3.5 w-3.5" /> Your Official Referral Link
              </span>
              <h3 className="text-lg font-bold">
                Invite members to your team and earn up to 10 levels of commissions
              </h3>
              <div className="flex items-center gap-2 max-w-xl">
                <input
                  type="text"
                  readOnly
                  value={summary?.referral_link || "Loading link..."}
                  className="w-full bg-black/25 text-white placeholder-white/50 text-xs sm:text-sm px-3.5 py-2 rounded-lg border border-white/20 focus:outline-none font-mono"
                />
                <Button
                  size="sm"
                  onClick={copyReferralLink}
                  className="bg-white text-blue-700 hover:bg-white/90 shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="hidden sm:inline ml-1">{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col justify-center items-center text-center space-y-1">
              <span className="text-xs text-blue-100 uppercase tracking-wider font-semibold">
                Your Referral Code
              </span>
              <span className="font-mono text-2xl font-black tracking-widest text-white">
                {summary?.referral_code || "..."}
              </span>
              <button
                onClick={copyCode}
                className="text-xs text-blue-200 hover:text-white underline inline-flex items-center gap-1 mt-1"
              >
                <Copy className="h-3 w-3" /> Copy Code Only
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direct Referrals (L1)
              </CardTitle>
              <UserCheck className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {summary?.direct_referrals ?? 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              8% direct group commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Team Size (L1–L10)
              </CardTitle>
              <Users className="h-4 w-4 text-indigo-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-gray-900 dark:text-white">
              {summary?.total_team_members ?? 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              Across all 10 network levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Rank
              </CardTitle>
              <Shield className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {summary?.current_rank || "SPP"}
              </span>
              <Badge variant="success" size="sm">Active</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {RANK_NAMES[summary?.current_rank || "SPP"]}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                My Sponsor / Upline
              </CardTitle>
              <GitFork className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900 dark:text-white truncate">
              {summary?.sponsor ? `@${summary.sponsor.username}` : "Top Level Leader"}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
              {summary?.sponsor ? `Code: ${summary.sponsor.referral_code}` : "Direct to Company"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-zinc-800">
        <button
          onClick={() => setActiveTab("members")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "members"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
          }`}
        >
          <Users className="h-4 w-4" /> Team Members ({downlines.length})
        </button>
        <button
          onClick={() => setActiveTab("levels")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "levels"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
          }`}
        >
          <Layers className="h-4 w-4" /> 10-Tier Level Summary
        </button>
        <button
          onClick={() => setActiveTab("tree")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "tree"
              ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-zinc-400"
          }`}
        >
          <GitFork className="h-4 w-4" /> Genealogy Tree View
        </button>
      </div>

      {/* TAB 1: MEMBERS LIST */}
      {activeTab === "members" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Downline Members</CardTitle>
                <CardDescription>
                  List of registered members under your 10-level hierarchy
                </CardDescription>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by username, code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>

                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-9 px-3 text-xs rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-900 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Levels (L1 - L10)</option>
                  {[...Array(10)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Level {i + 1} ({LEVEL_COMMISSIONS[`L${i + 1}`]} Commission)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-12 flex justify-center items-center gap-2 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                <span>Loading team members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-zinc-400">
                <Users className="mx-auto h-10 w-10 text-gray-300 dark:text-zinc-700 mb-2" />
                <p className="font-medium">No team members found in this level</p>
                <p className="text-xs mt-1">
                  Share your referral link with new members to start growing your tree!
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 dark:bg-zinc-800/50 dark:text-zinc-400">
                    <tr>
                      <th className="py-3 px-4">Level</th>
                      <th className="py-3 px-4">Member</th>
                      <th className="py-3 px-4">Referral Code</th>
                      <th className="py-3 px-4">Rank</th>
                      <th className="py-3 px-4">Sponsor</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {filteredMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
                        <td className="py-3 px-4">
                          <Badge variant={member.level === 1 ? "success" : "info"} size="sm">
                            L{member.level} ({LEVEL_COMMISSIONS[`L${member.level}`] || "0.2%"})
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            @{member.username}
                          </div>
                          {(member.first_name || member.last_name) && (
                            <div className="text-xs text-gray-500">
                              {member.first_name} {member.last_name}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                          {member.referral_code}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="purple" size="sm">
                            {member.current_rank}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600 dark:text-zinc-400">
                          @{member.sponsor_username || "Direct"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {member.phone_number || "—"}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {new Date(member.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: 10-TIER LEVEL SUMMARY */}
      {activeTab === "levels" && (
        <Card>
          <CardHeader>
            <CardTitle>10-Tier Group Commission & Team Breakdown</CardTitle>
            <CardDescription>
              Detailed view of members count and contract commission percentage allocated to each tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => {
                const levelKey = `L${i + 1}`;
                const count = summary?.level_counts?.[levelKey] ?? 0;
                const rate = LEVEL_COMMISSIONS[levelKey];

                return (
                  <div
                    key={levelKey}
                    className="p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">
                        Level {i + 1}
                      </span>
                      <Badge variant="success" size="sm">{rate}</Badge>
                    </div>
                    <div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">{count}</div>
                      <p className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {count === 1 ? "1 active member" : `${count} active members`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-300">
              <strong>💡 Commission Rule Note:</strong> Direct Sales Commission (DSC) is <strong>55%</strong>, and Group/Level Commission (L1–L10) allocates a combined total of <strong>20%</strong> (L1: 8%, L2: 5%, L3: 3%, L4: 2%, L5: 1%, L6–L10: 1% total).
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: TREE VIEW */}
      {activeTab === "tree" && (
        <Card>
          <CardHeader>
            <CardTitle>Genealogy Tree Diagram</CardTitle>
            <CardDescription>
              Visual hierarchy showing your network branch structure
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto py-8">
            {treeData ? (
              <div className="min-w-[600px] flex justify-center">
                <TreeNode node={treeData} isRoot={true} />
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
                Loading genealogy tree...
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

