'use client';

import React, { useState, useMemo } from 'react';
import { 
  Armchair, Check, Info, Sparkles, UserCheck, 
  Layers, RotateCcw, AlertCircle
} from 'lucide-react';

export interface SeatItem {
  id: string; // e.g., 'VIP-A-1'
  row: string; // 'A', 'B', etc.
  number: number;
  tierId: string;
  tierName: string;
  price: number;
  status: 'available' | 'selected' | 'reserved' | 'booked';
  zone: 'VIP Front Row' | 'Premium Center' | 'Standard Balcony';
}

interface VenueSeatingLayoutProps {
  requiredSeatsCount: number;
  selectedSeats: string[];
  onSeatSelect: (seats: string[]) => void;
  eventTitle?: string;
  venueName?: string;
}

// Generate realistic auditorium seating layout
function generateVenueSeats(): SeatItem[] {
  const seats: SeatItem[] = [];

  // Rows A-B: VIP Front Row
  const vipRows = ['A', 'B'];
  vipRows.forEach(row => {
    for (let num = 1; num <= 10; num++) {
      // Simulate few pre-booked seats
      const isPreBooked = (row === 'A' && (num === 4 || num === 5 || num === 6)) || (row === 'B' && num === 8);
      seats.push({
        id: `VIP-${row}-${num}`,
        row,
        number: num,
        tierId: 'tkt-vip',
        tierName: 'VIP All-Access',
        price: 3499,
        status: isPreBooked ? 'booked' : 'available',
        zone: 'VIP Front Row',
      });
    }
  });

  // Rows C-E: Premium Center
  const premiumRows = ['C', 'D', 'E'];
  premiumRows.forEach(row => {
    for (let num = 1; num <= 12; num++) {
      const isPreBooked = (row === 'C' && (num === 2 || num === 7)) || (row === 'D' && num === 5) || (row === 'E' && (num === 6 || num === 7));
      seats.push({
        id: `PREM-${row}-${num}`,
        row,
        number: num,
        tierId: 'tkt-prem',
        tierName: 'Premium Center',
        price: 2199,
        status: isPreBooked ? 'booked' : 'available',
        zone: 'Premium Center',
      });
    }
  });

  // Rows F-H: Standard Balcony
  const standardRows = ['F', 'G', 'H'];
  standardRows.forEach(row => {
    for (let num = 1; num <= 12; num++) {
      const isPreBooked = (row === 'F' && (num === 1 || num === 12)) || (row === 'G' && (num === 3 || num === 4));
      seats.push({
        id: `STD-${row}-${num}`,
        row,
        number: num,
        tierId: 'tkt-std',
        tierName: 'Standard Balcony',
        price: 1149,
        status: isPreBooked ? 'booked' : 'available',
        zone: 'Standard Balcony',
      });
    }
  });

  return seats;
}

export function VenueSeatingLayout({
  requiredSeatsCount,
  selectedSeats,
  onSeatSelect,
  eventTitle,
  venueName,
}: VenueSeatingLayoutProps) {
  const [seatsState] = useState<SeatItem[]>(() => generateVenueSeats());
  const [activeZoneFilter, setActiveZoneFilter] = useState<'all' | 'VIP Front Row' | 'Premium Center' | 'Standard Balcony'>('all');
  const [hoveredSeat, setHoveredSeat] = useState<SeatItem | null>(null);

  // Group seats by Zone & Row
  const rows = useMemo(() => {
    const rowMap: Record<string, SeatItem[]> = {};
    seatsState.forEach(seat => {
      if (!rowMap[seat.row]) {
        rowMap[seat.row] = [];
      }
      rowMap[seat.row].push(seat);
    });
    return rowMap;
  }, [seatsState]);

  const handleSeatClick = (seat: SeatItem) => {
    if (seat.status === 'booked' || seat.status === 'reserved') return;

    const isAlreadySelected = selectedSeats.includes(seat.id);

    if (isAlreadySelected) {
      // Deselect
      onSeatSelect(selectedSeats.filter(id => id !== seat.id));
    } else {
      // Limit to required count or allow selecting up to requiredSeatsCount
      if (requiredSeatsCount > 0 && selectedSeats.length >= requiredSeatsCount) {
        // Replace oldest or shift
        const updated = [...selectedSeats.slice(1), seat.id];
        onSeatSelect(updated);
      } else {
        onSeatSelect([...selectedSeats, seat.id]);
      }
    }
  };

  const clearSelection = () => {
    onSeatSelect([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E7E5E4] p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E7E5E4] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-teal-50 text-[#0F766E] border border-teal-200">
              <Armchair className="h-4 w-4" />
            </span>
            <h3 className="font-extrabold text-[#1C1917] text-base">
              Interactive Venue Seating Selection
            </h3>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-200">
              Live Map
            </span>
          </div>
          <p className="text-xs text-[#78716C] mt-1">
            Pick your preferred row and seats in real-time. {venueName ? `Venue: ${venueName}` : ''}
          </p>
        </div>

        {/* Selected Count Indicator */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Seats Chosen</span>
            <span className="font-mono text-sm font-black text-[#0F766E]">
              {selectedSeats.length} {requiredSeatsCount > 0 ? `/ ${requiredSeatsCount} Pass${requiredSeatsCount > 1 ? 'es' : ''}` : 'selected'}
            </span>
          </div>

          {selectedSeats.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg border border-rose-200 flex items-center gap-1 transition"
              title="Reset selected seats"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend & Seat Color Codes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-white border-2 border-slate-300 inline-block shadow-xs" />
            <span className="text-[11px] font-bold text-slate-600">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-[#0F766E] border-2 border-[#0F766E] inline-block shadow-xs" />
            <span className="text-[11px] font-bold text-[#0F766E]">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-300 border-2 border-slate-400 inline-block" />
            <span className="text-[11px] font-bold text-slate-400">Booked</span>
          </div>
        </div>

        {/* Zone Tier Filters */}
        <div className="flex items-center gap-1.5 text-[11px]">
          {(['all', 'VIP Front Row', 'Premium Center', 'Standard Balcony'] as const).map(zone => (
            <button
              key={zone}
              type="button"
              onClick={() => setActiveZoneFilter(zone)}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeZoneFilter === zone
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {zone === 'all' ? 'All Rows' : zone.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Stage Visual Projection */}
      <div className="relative py-3">
        <div className="w-3/4 max-w-md mx-auto text-center">
          <div className="h-2 rounded-t-full bg-gradient-to-r from-teal-500 via-[#F97316] to-teal-500 shadow-md" />
          <div className="bg-gradient-to-b from-slate-100 to-transparent py-1.5 border-b border-dashed border-slate-300">
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 flex items-center justify-center gap-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" /> STAGE / SPEAKER PODIUM <Sparkles className="h-3 w-3 text-amber-500" />
            </span>
          </div>
        </div>
      </div>

      {/* Seating Map Grid (Scrollable horizontally on mobile) */}
      <div className="overflow-x-auto pb-4 pt-2">
        <div className="min-w-[540px] max-w-xl mx-auto space-y-2.5">
          {Object.entries(rows).map(([rowLetter, rowSeats]) => {
            const rowZone = rowSeats[0]?.zone;
            if (activeZoneFilter !== 'all' && rowZone !== activeZoneFilter) {
              return null;
            }

            return (
              <div key={rowLetter} className="flex items-center justify-center gap-3">
                {/* Row Letter Left */}
                <span className="w-5 text-center font-mono font-black text-xs text-slate-400">
                  {rowLetter}
                </span>

                {/* Seat Buttons in Row */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {rowSeats.map((seat, seatIdx) => {
                    const isSelected = selectedSeats.includes(seat.id);
                    const isBooked = seat.status === 'booked';
                    
                    // Create an aisle after half seats
                    const isAisle = seatIdx === Math.floor(rowSeats.length / 2) - 1;

                    return (
                      <React.Fragment key={seat.id}>
                        <button
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seat)}
                          onMouseEnter={() => setHoveredSeat(seat)}
                          onMouseLeave={() => setHoveredSeat(null)}
                          className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center justify-center ${
                            isBooked
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300/80'
                              : isSelected
                              ? 'bg-[#0F766E] text-white border-2 border-teal-800 shadow-md scale-105 z-10'
                              : seat.zone === 'VIP Front Row'
                              ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:border-[#0F766E] hover:bg-teal-50 hover:text-[#0F766E]'
                              : seat.zone === 'Premium Center'
                              ? 'bg-blue-50 text-blue-900 border border-blue-200 hover:border-[#0F766E] hover:bg-teal-50 hover:text-[#0F766E]'
                              : 'bg-white text-slate-700 border border-slate-300 hover:border-[#0F766E] hover:bg-teal-50 hover:text-[#0F766E]'
                          }`}
                          title={`${seat.zone} - Row ${seat.row}, Seat ${seat.number} (₹${seat.price.toLocaleString()})`}
                        >
                          {isSelected ? (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          ) : (
                            <span>{seat.number}</span>
                          )}
                        </button>

                        {/* Visual Aisle Spacer */}
                        {isAisle && <div className="w-4 sm:w-6" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Row Letter Right */}
                <span className="w-5 text-center font-mono font-black text-xs text-slate-400">
                  {rowLetter}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hovered Seat Info Pill / Quick Inspector */}
      <div className="bg-[#FAFAF9] p-3 rounded-xl border border-[#E7E5E4] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-[#0F766E] shrink-0" />
          {hoveredSeat ? (
            <span className="text-slate-700 font-medium">
              Hovered: <strong>Row {hoveredSeat.row}, Seat {hoveredSeat.number}</strong> • {hoveredSeat.zone} •{' '}
              <strong className="text-[#0F766E]">₹{hoveredSeat.price.toLocaleString()}</strong>
              {hoveredSeat.status === 'booked' ? ' (Already Booked)' : ' (Available)'}
            </span>
          ) : (
            <span className="text-slate-500">
              Hover over or tap any seat to view zone, row, and pricing details.
            </span>
          )}
        </div>

        {/* Selected Seats Badges */}
        {selectedSeats.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 self-stretch sm:self-auto">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Selected:</span>
            {selectedSeats.map(seatId => (
              <span
                key={seatId}
                className="px-2 py-0.5 rounded-md bg-[#0F766E] text-white font-mono text-[10px] font-bold shadow-2xs"
              >
                {seatId.replace('VIP-', '').replace('PREM-', '').replace('STD-', '')}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

