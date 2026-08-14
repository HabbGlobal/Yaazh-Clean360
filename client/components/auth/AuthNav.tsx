import Link from "next/link";
export default function AuthNav(){return <nav className="auth-nav" aria-label="Account"><Link className="nav-login" href="/login">Log in</Link><Link className="nav-signup" href="/signup">Sign up</Link></nav>}
