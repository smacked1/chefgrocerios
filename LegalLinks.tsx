/*
 * ChefGrocer - AI-Powered Smart Cooking Assistant
 * Copyright (c) 2025 Myles Barber. All rights reserved.
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries: dxmylesx22@gmail.com
 */

import React from 'react';
import { Button } from "@/components/ui/button";

export function LegalLinks() {
  return (
    <div className="flex justify-center items-center gap-4 py-4 text-sm text-gray-600">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => window.location.href = '/privacy-policy'}
        className="text-gray-600 hover:text-gray-800"
      >
        Privacy Policy
      </Button>
      <span>|</span>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => window.location.href = '/terms'}
        className="text-gray-600 hover:text-gray-800"
      >
        Terms of Use
      </Button>
    </div>
  );
}