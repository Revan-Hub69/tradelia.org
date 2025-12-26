import { AppProviders } from '../../components/AppProviders'

export default function TradeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppProviders>{children}</AppProviders>
}
