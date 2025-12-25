'use client'

import React, { useState } from 'react'
import { InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { AccessibleDrawer } from './AccessibleDrawer'

export const RiskBanner: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Single, very compact banner */}
      <div className="py-2 px-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="h-4 w-4 text-amber-600" />
            <span className="text-sm text-amber-800">
              <strong>9.9 miliardi $</strong> in scam crypto nel 2024
            </span>
          </div>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-1 text-xs text-amber-700 hover:text-amber-900"
            aria-label="Scopri di più sui rischi crypto"
          >
            <InformationCircleIcon className="h-3 w-3" />
            <span>Dettagli</span>
          </button>
        </div>
      </div>

      {/* Educational Drawer */}
      <AccessibleDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Rischi Crypto - Informazioni Educative"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 mb-1">9.9 miliardi $</div>
            <div className="text-sm text-gray-600">Scam crypto 2024</div>
            <div className="text-xs text-gray-500 mt-1">Fonte: Chainalysis via Reuters</div>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Cosa significa</h4>
              <p className="text-sm text-gray-700">
                Nel 2024 sono stati persi 9.9 miliardi di dollari a causa di frodi crypto,
                inclusi rug pull, phishing e scam di investimento.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Come proteggersi</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Verifica sempre i progetti prima di investire</li>
                <li>• Usa exchange regolamentati</li>
                <li>• Non condividere mai chiavi private</li>
                <li>• Abilita autenticazione a due fattori</li>
              </ul>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center bg-blue-50 p-3 rounded border">
            <strong>Nota educativa:</strong> Queste informazioni sono presentate esclusivamente
            per fini educativi. Non costituiscono consiglio finanziario.
          </div>
        </div>
      </AccessibleDrawer>
    </>
  )
}
