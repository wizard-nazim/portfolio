export default function Pullquote({ children }: { children: React.ReactNode }) {
  return (
    <div className="pullquote">
      <p>{children}</p>
    </div>
  )
}
