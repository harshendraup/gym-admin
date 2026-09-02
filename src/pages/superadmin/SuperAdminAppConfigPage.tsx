import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle, Building2, Image, LayoutGrid, Palette, Rocket,
  Settings2, Smartphone, Sparkles, Type, Wallet,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageLoader } from '@/components/common/PageLoader'
import { useBusinesses } from '@/hooks/useBusinesses'
import { useAppConfig } from '@/hooks/useAppConfig'
import GymProfileSection from '@/components/app-config/GymProfileSection'
import BrandingThemeSection from '@/components/app-config/BrandingThemeSection'
import ContentSection from '@/components/app-config/ContentSection'
import AssetsSection from '@/components/app-config/AssetsSection'
import QuickAccessSection from '@/components/app-config/QuickAccessSection'
import FeaturesSection from '@/components/app-config/FeaturesSection'
import ReleaseSection from '@/components/app-config/ReleaseSection'
import PaymentSection from '@/components/app-config/PaymentSection'
import PreviewPanel from '@/components/app-config/PreviewPanel'
import VersionsPanel from '@/components/app-config/VersionsPanel'

const TABS = [
  { value: 'gym', label: 'Gym Profile', icon: Building2 },
  { value: 'branding', label: 'Branding & Theme', icon: Palette },
  { value: 'content', label: 'Content', icon: Type },
  { value: 'assets', label: 'Assets', icon: Image },
  { value: 'quick', label: 'Quick Access', icon: LayoutGrid },
  { value: 'features', label: 'Features', icon: Settings2 },
  { value: 'release', label: 'Release & Keys', icon: Rocket },
  { value: 'payment', label: 'Payment & Signup', icon: Wallet },
  { value: 'preview', label: 'Preview', icon: Smartphone },
  { value: 'versions', label: 'History', icon: Sparkles },
]

/**
 * Super-admin white-label configuration for one gym's mobile app.
 *
 * Reachable both as a standalone page with a business picker and as a deep
 * link from the Businesses list (`/superadmin/businesses/:businessId/app-config`).
 *
 * Each tab saves its own section — one request per tab means two admins
 * working on different tabs never overwrite each other, and each payload is
 * validated against that section's real schema instead of landing in an
 * unchecked blob.
 */
export default function SuperAdminAppConfigPage() {
  const { businessId: routeBusinessId } = useParams<{ businessId?: string }>()
  const navigate = useNavigate()
  const { data: businesses, isLoading: businessesLoading } = useBusinesses()

  const [selectedId, setSelectedId] = useState<number | undefined>(
    routeBusinessId ? Number(routeBusinessId) : undefined
  )

  // With no business in the URL, land on the first one rather than showing an
  // empty shell — a super admin almost always has one gym in mind already.
  useEffect(() => {
    if (!businesses?.length) return
    // Also covers a business that has since been deleted: the id lingers in
    // this component's state (and in the URL) long after it left the list.
    if (selectedId && businesses.some((business) => business.id === selectedId)) return
    setSelectedId(businesses[0].id)
  }, [businesses, selectedId])

  useEffect(() => {
    if (routeBusinessId) setSelectedId(Number(routeBusinessId))
  }, [routeBusinessId])

  const { data: config, isLoading, isError, error, refetch } = useAppConfig(selectedId)

  // React Query hands back the last good payload while a refetch fails, so
  // without this the page would show an error banner above a form still
  // rendering stale values — and a Save from it would write them back.
  const liveConfig = isError ? undefined : config

  const selectedBusiness = useMemo(
    () => businesses?.find((business) => business.id === selectedId),
    [businesses, selectedId]
  )

  return (
    <div className="flex h-full flex-col">
      <Header title="App Configuration" />

      <div className="flex-1 overflow-auto p-6">
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl px-6 py-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.92) 100%)',
            border: '1px solid rgba(59,130,246,0.18)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
          }}
        >
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              {selectedBusiness?.businessName ?? 'Select a business'}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Everything the mobile app reads on launch — branding, copy, assets, features and
              release gating for this gym.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {liveConfig && (
              <div className="text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Revision
                </p>
                <p className="font-mono text-sm font-semibold text-slate-700">
                  r{liveConfig.revision}
                  {!liveConfig.isConfigured && (
                    <span className="ml-2 text-xs font-normal text-slate-400">not configured</span>
                  )}
                </p>
              </div>
            )}

            <select
              className="h-10 min-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={selectedId ?? ''}
              disabled={businessesLoading}
              onChange={(e) => {
                const next = Number(e.target.value)
                setSelectedId(next)
                // Keep the URL shareable when the page was opened as a deep link.
                if (routeBusinessId) navigate(`/superadmin/businesses/${next}/app-config`)
              }}
            >
              {(businesses ?? []).map((business) => (
                <option key={business.id} value={business.id}>
                  {business.businessName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && <PageLoader />}

        {isError && (
          <div
            className="flex items-start gap-3 rounded-2xl px-6 py-5"
            style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#DC2626' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#B91C1C' }}>
                Couldn't load this business's configuration
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                {(error as any)?.response?.data?.message ??
                  'The business may have been removed, or the API is unreachable.'}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-2 text-sm font-semibold underline"
                style={{ color: '#B91C1C' }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* A gym the backfill never reached is still served from the old
            blob. The forms below already show its live values, and saving
            any tab carries the whole thing across — but the admin should
            know that's what the next Save does. */}
        {liveConfig?.isLegacy && (
          <div
            className="mb-5 flex items-start gap-3 rounded-2xl px-6 py-4"
            style={{ background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.22)' }}
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: '#B45309' }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                Still on the legacy configuration
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                This gym's app is served from the old <code>meta_business</code> record. The fields
                below show what it's running today — saving any tab migrates all of it onto the new
                configuration, without changing what members see.
              </p>
            </div>
          </div>
        )}

        {liveConfig && selectedId && (
          <Tabs defaultValue="gym">
            <TabsList className="mb-1 flex h-auto flex-wrap justify-start gap-1 bg-transparent p-0">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-1.5 rounded-xl border border-transparent px-3 py-2 data-[state=active]:border-blue-200 data-[state=active]:bg-white"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="gym">
              <GymProfileSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="branding">
              <BrandingThemeSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="content">
              <ContentSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="assets">
              <AssetsSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="quick">
              <QuickAccessSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="features">
              <FeaturesSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="release">
              <ReleaseSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="payment">
              <PaymentSection businessId={selectedId} config={liveConfig} />
            </TabsContent>
            <TabsContent value="preview">
              <PreviewPanel businessId={selectedId} />
            </TabsContent>
            <TabsContent value="versions">
              <VersionsPanel businessId={selectedId} config={liveConfig} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
