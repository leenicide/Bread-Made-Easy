"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { CheckCircle, DollarSign, Clock, Star, ArrowRight, Calendar } from "lucide-react"
import { StrategyCallModal } from "@/components/strategy-call-modal"
import Link from "next/link"

export default function AbandonedCheckoutPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleYes = () => {
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Header />
      
      <main className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 bg-orange-100 text-orange-800 border-orange-200">
              <Clock className="h-4 w-4 mr-2" />
              Limited Time Offer
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Did we do something wrong?
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              I know you're probably thinking something along the lines of "this seems like a really good opportunity but $3000 is a lot of money to spend to try out this system, is it even worth it?" or maybe you're thinking "I'm not sure about all this, I don't really understand any of this or how it works...do they really bake bread in those ovens?"
            </p>
          </div>

          {/* Main Content */}
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl font-bold text-orange-600 mb-4">
                And the answer to both of those questions is YES!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-lg leading-relaxed">
              <p>
                Yes, 3000 thousand dollars is a lot of money to spend on money printing systems but now I must ask you that if you had lets say a Wealth Machine in your house that every time you put a gold coin in and it returned to you 2 gold coins every time you did this, how many coins would you put in that machine? One coin? 10 coins? Three thousand coins? How about a million coins? I assume you would say "as much as humanly possible".
              </p>
              
              <p>
                But now lets say you were the manufacturer of this machine. Would you keep all the machines to yourself and have more machines than the amount of coins you have to insert in them? Or sell the excess Wealth Machines for a large sum of money? As the amount of profit the customers could make off the machine would essentially be limitless and depend solely on the amount of time they are willing to spend putting coins in them...
              </p>

              <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-400">
                <p className="font-semibold text-orange-800">
                  Now At Bread Made Easy we were faced with this dilemma. We wanted to make money from our wealth machines but we also wanted to help people who might struggle knowing how to use one these machines or might not have the resources to be able to spend a large amount on such a machine but actually need one to free themselves from economic slavery the ability to do so.
                </p>
              </div>

              <p>
                So this is how we solved the dilemma, we decided to let you guys borrow the Wealth Machines as long as you agreed to give us one out of 3 of the gold coins the wealth machine created which we thought was fair. But what if the person didn't have enough coins to put in the wealth machine as the machine only starts giving back coins once three thousand coins have been inserted what happens then?
              </p>

              <p>
                Well we would consider any person who cannot or will not invest the three thousand coins of their own to turn them into six thousand coins in total and then give Bread Made Easy one thousand of those coins and be left with five thousand coins for themselves (a two thousand coin increase) as not suitable for the program. This is because they are lacking sufficient knowledge of the system and we don't want to provide this service to anyone who does not need it.
              </p>
            </CardContent>
          </Card>

          {/* Offer Section */}
          <Card className="mb-8 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold mb-4">
                However, if this helped you gain a better understanding...
              </CardTitle>
              <CardDescription className="text-orange-100 text-lg">
                Book a strategy call below, attend and register for a lease and we will give you $250 of management budget for your first month, on the house. Thank us later.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center gap-2 mb-6">
                <DollarSign className="h-8 w-8" />
                <span className="text-4xl font-bold">$250</span>
                <span className="text-xl">off your first month</span>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={handleYes}
                  size="lg" 
                  className="bg-white text-orange-600 hover:bg-orange-50 text-lg px-8 py-4 h-auto"
                >
                  <CheckCircle className="h-6 w-6 mr-2" />
                  Yes, Book My Strategy Call
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>


          {/* CTA Section */}
          <div className="text-center mt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              So what are you waiting for?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Book your strategy call today!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleYes}
                size="lg" 
                className="bg-orange-600 hover:bg-orange-700 text-white text-lg px-8 py-4 h-auto"
              >
                <Star className="h-6 w-6 mr-2" />
                Book Strategy Call Now
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="text-orange-600 border-orange-600 hover:bg-orange-50 text-lg px-8 py-4 h-auto"
              >
                <Link href="/">
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Strategy Call Modal */}
      <StrategyCallModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </div>
  )
}
