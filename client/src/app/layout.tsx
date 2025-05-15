import './globals.css';
import NavbarWrapper from "@/components/NavbarWrapper";

export const metadata = {
  title: "BloodNet",
  description: "Connect with BloodNet",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (        
    <html lang="en">
      <body className='bg-black'>
       <NavbarWrapper />
       {children}
      </body>
    </html>
  )
}
