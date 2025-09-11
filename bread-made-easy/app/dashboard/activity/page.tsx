"use client"

import { Header } from "@/components/header"
import { RecentActivity } from "@/components/recent-activity"

export default function ActivityPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">All Activity</h1>
          <RecentActivity limit={50} />
        </div>
      </main>
    </div>
  )
}


