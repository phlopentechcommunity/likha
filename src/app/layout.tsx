import "./globals.css";
export const metadata = {title:"LIKHA | PH OpenTech",description:"Project-to-Helm Factory"};
export default function RootLayout({children}:{children:React.ReactNode}) {
 return <html lang="en"><body><nav className="navbar navbar-expand-lg navbar-dark px-4 py-3">
 <a className="navbar-brand fw-bold" href="/">LIKHA</a><span className="text-muted ms-2">PH OpenTech · Project-to-Helm Factory</span>
 </nav><main className="container-fluid p-4">{children}</main></body></html>;
}
