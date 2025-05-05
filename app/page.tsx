'use client';

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { WbtcPriceChart } from "@/components/WbtcPriceChart"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react";
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { FloatingCopium } from '@/components/FloatingCopium';

// Define Listing type
interface Listing {
  id: number;
  strikePrice: number;
  deposit: number;
  expiry: string; // Using string for simplicity with date input
  btcAmount: number;
}

// Define User Position type
interface UserPosition extends Omit<Listing, 'id'> { // Reuse Listing fields, omit generic id
  positionId: string; // More specific ID for a user's holding
  userRole: 'Buyer' | 'Poster';
  status: 'Active' | 'Settled' | 'Expired (Forfeited)' | 'Expired (Settled)'; // Example statuses
  // Add any other user-specific details if needed
}

// Sample hardcoded data for listings
const sampleListings: Listing[] = [
  { id: 1, strikePrice: 65000, deposit: 1000, expiry: '2024-12-31', btcAmount: 1 },
  { id: 2, strikePrice: 68000, deposit: 1200, expiry: '2025-01-15', btcAmount: 0.5 },
  { id: 3, strikePrice: 62000, deposit: 800, expiry: '2024-11-30', btcAmount: 2 },
  { id: 4, strikePrice: 70000, deposit: 1500, expiry: '2025-03-01', btcAmount: 1.5 },
  { id: 5, strikePrice: 65000, deposit: 950, expiry: '2024-12-20', btcAmount: 0.8 },
];

// Sample hardcoded data for the connected user's positions
const sampleUserPositions: UserPosition[] = [
  {
    positionId: 'BUY-001',
    userRole: 'Buyer',
    strikePrice: 65000,
    deposit: 1000,
    expiry: '2024-12-31',
    btcAmount: 1,
    status: 'Active' 
  },
  {
    positionId: 'POST-002',
    userRole: 'Poster',
    strikePrice: 70000,
    deposit: 1500, // Deposit made by the buyer
    expiry: '2025-03-01',
    btcAmount: 1.5,
    status: 'Active'
  },
  {
    positionId: 'BUY-003',
    userRole: 'Buyer',
    strikePrice: 60000,
    deposit: 500,
    expiry: '2024-08-01', // Expired
    btcAmount: 0.2,
    status: 'Expired (Forfeited)' // Example: Price was below strike at expiry
  },
    {
    positionId: 'POST-004',
    userRole: 'Poster',
    strikePrice: 62000,
    deposit: 800,
    expiry: '2024-09-15',
    btcAmount: 2,
    status: 'Active'
  },
];

export default function BearBonds() {
  const [isCreateListingModalOpen, setIsCreateListingModalOpen] = useState(false);
  const [isMatchListingModalOpen, setIsMatchListingModalOpen] = useState(false);

  // State for filters
  const [filterPriceMin, setFilterPriceMin] = useState('');
  const [filterPriceMax, setFilterPriceMax] = useState('');
  const [filterExpiryMax, setFilterExpiryMax] = useState('');
  const [filterDepositMin, setFilterDepositMin] = useState('');

  // State for displayed listings
  const [filteredListings, setFilteredListings] = useState<Listing[]>(sampleListings);

  // NOTE: We are using static sampleUserPositions. In a real app, you'd fetch this based on the connected wallet.
  const userPositions = sampleUserPositions;

  // Effect to apply filters when filter values change
  useEffect(() => {
    let listings = sampleListings;

    if (filterPriceMin) {
      listings = listings.filter(l => l.strikePrice >= parseFloat(filterPriceMin));
    }
    if (filterPriceMax) {
      listings = listings.filter(l => l.strikePrice <= parseFloat(filterPriceMax));
    }
    if (filterDepositMin) {
      listings = listings.filter(l => l.deposit >= parseFloat(filterDepositMin));
    }
    if (filterExpiryMax) {
      listings = listings.filter(l => new Date(l.expiry) <= new Date(filterExpiryMax));
    }

    setFilteredListings(listings);
  }, [filterPriceMin, filterPriceMax, filterDepositMin, filterExpiryMax]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans">
      {/* Render the floating image components */}
      <FloatingCopium imageSrc="/redwojak.png" initialDelay={1} />
      <FloatingCopium imageSrc="/greenwojak.png" initialDelay={2} />
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-black tracking-tight">BTC LAYAWAY</h1>
          
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gray-100 rounded-full flex text-sm">
            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Top Cards - Swapped Card 1 and Red Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Red Bear Bonds Sidebar - Moved Here & Updated */}
        <Card className="bg-red-600 text-white p-6 flex flex-col">
          <div className="space-y-2">
            <div className="text-3xl font-black">BTC LAYAWAY</div>
            <div className="text-3xl font-black">BTC LAYAWAY</div>
            <div className="text-3xl font-black">BTC LAYAWAY</div>
            <div className="text-3xl font-black">BTC LAYAWAY</div>
          </div>
          <p className="text-xs text-black mt-4 flex-grow">
            The BTC Layaway Protocol is a simple, intent-based settlement system that allows users 
            to lock in the future purchase of BTCN (Bitcoin-native token on Corn) at a fixed price 
            by putting down partial collateral. It provides physically settled, asymmetric exposure to BTC 
            without requiring margin, price oracles, or synthetic instruments.
          </p>
        </Card>

        {/* Card 2 - Poster (Remains) */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-8">Poster</h2>
          <p className="text-sm mb-4">List and lock BTC in the contract and set the terms for your BTC listing.</p>

          <p className="text-sm mb-4">Set strike price: Amount of USDT the buyer must pay at settlement</p>

          <p className="text-sm mb-6">
            Set deposit amount: Amount of USDT buyer must post to activate the contract.
          </p>
          <p className="text-sm mb-6">set expiry: Date the contract expires</p>

          <div className="space-y-4">
            <Dialog open={isCreateListingModalOpen} onOpenChange={setIsCreateListingModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gray-800 hover:bg-gray-900 text-white w-full">Create Listing</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Create New Listing</DialogTitle>
                  <DialogDescription>
                    Set the terms for your BTC listing.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="strike-price" className="text-right col-span-1">
                      Set Strike Price
                    </Label>
                    <Input id="strike-price" type="number" placeholder="e.g., 65000" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deposit-amount" className="text-right col-span-1">
                      Set Deposit Amount
                    </Label>
                    <Input id="deposit-amount" type="number" placeholder="e.g., 1000" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="expiry" className="text-right col-span-1">
                       Set Expiry
                    </Label>
                    <Input id="expiry" type="date" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white">Create Listing</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Card 3 - Buyer (Remains) */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-8">Buyer</h2>

          <p className="text-sm mb-4">Match listings by depositing USDT you want to buy BTC for and the amount of BTC you want to buy.</p>

<p className="text-sm mb-4">Can settle before expiry</p>

<p className="text-sm mb-6">
You can transfer position to move rights.
<br />
<br />
Or do nothing and forfeit deposit amount if expiry passes.
</p>


<div className="space-y-4">
  <Dialog open={isMatchListingModalOpen} onOpenChange={setIsMatchListingModalOpen}>
    <DialogTrigger asChild>
      <Button className="bg-gray-800 hover:bg-gray-900 text-white w-full">Match Listing</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Match Listing</DialogTitle>
        <DialogDescription>
          Enter the details to match an existing BTC listing.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="deposit-amount-match" className="text-right col-span-1">
            Deposit Amount (USDT)
          </Label>
          <Input id="deposit-amount-match" type="number" placeholder="Confirm deposit amount" className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white">Match Listing</Button>
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            Cancel
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</div>
        </Card>
      </div>

      {/* WBTC Price Chart Section */}
      <div className="mb-6 relative">
        <Card className="p-4 pb-6">
          <WbtcPriceChart />
        </Card>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Your Positions Card (First Position) */}
        <Card className="p-6 col-span-1">
           <h2 className="text-2xl font-bold mb-4">Your Positions</h2>

          {userPositions.length > 0 ? (
            <div className="space-y-4 overflow-y-auto max-h-96 pr-2"> {/* Added scroll */} 
              {userPositions.map((pos) => (
                <Card key={pos.positionId} className="p-3 text-sm bg-white border">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-semibold ${pos.userRole === 'Buyer' ? 'text-blue-600' : 'text-purple-600'}`}> 
                      {pos.userRole} Position #{pos.positionId.split('-')[1]}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">{pos.status}</span>
                  </div>
                  
                  <div className="text-xs text-gray-700 space-y-0.5 mb-2">
                     <div><span className="font-medium">Amount:</span> {pos.btcAmount} BTC</div>
                     <div><span className="font-medium">Strike:</span> ${pos.strikePrice.toLocaleString()}</div>
                     {/* Show deposit differently based on role */}
                     {pos.userRole === 'Buyer' ? (
                         <div><span className="font-medium">Your Deposit:</span> ${pos.deposit.toLocaleString()}</div>
                     ) : (
                         <div><span className="font-medium">Buyer's Deposit:</span> ${pos.deposit.toLocaleString()}</div>
                     )}
                     <div><span className="font-medium">Expiry:</span> {pos.expiry}</div>
                  </div>

                  {/* Placeholder Action Buttons based on status/role */}
                  <div className="flex gap-2 mt-2">
                    {pos.status === 'Active' && pos.userRole === 'Buyer' && (
                      <Button size="sm" variant="outline" className="flex-1 h-7">Settle</Button>
                    )}
                     {pos.status === 'Active' && pos.userRole === 'Buyer' && (
                      <Button size="sm" variant="outline" className="flex-1 h-7">Transfer</Button>
                    )}
                    {pos.status === 'Active' && pos.userRole === 'Poster' && (
                         <Button size="sm" variant="outline" disabled className="flex-1 h-7 text-gray-400">Waiting</Button>
                     )}
                      {(pos.status === 'Expired (Settled)' || pos.status === 'Settled') && pos.userRole === 'Poster' && (
                       <Button size="sm" variant="outline" className="flex-1 h-7">Withdraw</Button>
                     )}
                      {/* Add more buttons for other states/roles as needed */} 
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center mt-4">You have no active or past positions.</p>
          )}
        </Card>

        {/* Listings Card (Middle Position) */}
        <Card className="p-6 col-span-1 md:col-span-2">
           <h2 className="text-2xl font-bold mb-4">Listings</h2>

          {/* Filter Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <Label htmlFor="filter-price-min" className="text-sm">Min Price</Label>
              <Input id="filter-price-min" type="number" placeholder="e.g., 60000" value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-price-max" className="text-sm">Max Price</Label>
              <Input id="filter-price-max" type="number" placeholder="e.g., 70000" value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-deposit-min" className="text-sm">Min Deposit</Label>
              <Input id="filter-deposit-min" type="number" placeholder="e.g., 500" value={filterDepositMin} onChange={(e) => setFilterDepositMin(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="filter-expiry-max" className="text-sm">Max Expiry</Label>
              <Input id="filter-expiry-max" type="date" value={filterExpiryMax} onChange={(e) => setFilterExpiryMax(e.target.value)} className="mt-1" />
            </div>
          </div>

          {/* Listings Display Area */}
          <div className="space-y-3 overflow-y-auto max-h-60 pr-2">
            {filteredListings.length > 0 ? (
              filteredListings.map((listing) => (
                <Card key={listing.id} className="p-3 text-sm bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span>ID: {listing.id}</span>
                    <span className="font-semibold">{listing.btcAmount} BTC</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    <span>Strike: ${listing.strikePrice.toLocaleString()}</span> | 
                    <span>Deposit: ${listing.deposit.toLocaleString()}</span> | 
                    <span>Expiry: {listing.expiry}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2 bg-gray-800 hover:bg-gray-900 text-white h-8">Match</Button>
                </Card>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center">No listings match the current filters.</p>
            )}
          </div>
        </Card>
      </div>

    </div>
  )
}
