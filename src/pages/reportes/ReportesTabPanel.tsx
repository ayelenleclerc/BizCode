import type { ReactNode } from 'react'

type TabId = 'ventas' | 'stock' | 'cobranzas'

type Props = {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  labels: Record<TabId, string>
  tabListLabel: string
  ventasPanel: ReactNode
  stockPanel: ReactNode
  cobranzasPanel: ReactNode
  ventasVisible: boolean
  stockVisible: boolean
  cobranzasVisible: boolean
}

export default function ReportesTabPanel({
  activeTab,
  onTabChange,
  labels,
  tabListLabel,
  ventasPanel,
  stockPanel,
  cobranzasPanel,
  ventasVisible,
  stockVisible,
  cobranzasVisible,
}: Props) {
  const tabs: { id: TabId; visible: boolean }[] = [
    { id: 'ventas', visible: ventasVisible },
    { id: 'stock', visible: stockVisible },
    { id: 'cobranzas', visible: cobranzasVisible },
  ]

  return (
    <div data-testid="reportes-page-content">
      <div role="tablist" aria-label={tabListLabel} className="flex gap-2 border-b border-slate-200 dark:border-slate-700 mb-4">
        {tabs
          .filter((tab) => tab.visible)
          .map((tab) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`reportes-tab-${tab.id}`}
                {...(selected
                  ? { 'aria-selected': 'true' as const }
                  : { 'aria-selected': 'false' as const })}
                aria-controls={`reportes-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  selected
                    ? 'border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'border-transparent text-slate-600 dark:text-slate-400'
                }`}
                data-testid={`reportes-tab-${tab.id}`}
              >
                {labels[tab.id]}
              </button>
            )
          })}
      </div>
      {activeTab === 'ventas' && ventasVisible ? (
        <div role="tabpanel" id="reportes-panel-ventas" aria-labelledby="reportes-tab-ventas">
          {ventasPanel}
        </div>
      ) : null}
      {activeTab === 'stock' && stockVisible ? (
        <div role="tabpanel" id="reportes-panel-stock" aria-labelledby="reportes-tab-stock">
          {stockPanel}
        </div>
      ) : null}
      {activeTab === 'cobranzas' && cobranzasVisible ? (
        <div role="tabpanel" id="reportes-panel-cobranzas" aria-labelledby="reportes-tab-cobranzas">
          {cobranzasPanel}
        </div>
      ) : null}
    </div>
  )
}

export type { TabId }
