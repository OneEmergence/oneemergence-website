/**
 * Portal entry layout — minimal, no Navbar/Footer.
 * The threshold experience is self-contained.
 */
export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
