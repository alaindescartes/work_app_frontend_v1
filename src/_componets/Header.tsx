'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { userSignOut } from '@/redux/slices/userSlice';
import { AppDispatch } from '@/redux/store';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await response.json();

      if (response.ok) {
        router.push('/sign-in');
        toast('Successfully logged out', {
          style: { backgroundColor: 'green', color: 'white' },
        });
        dispatch(userSignOut());
        return;
      } else {
        toast(data.message || 'Logout failed', {
          style: { backgroundColor: 'red', color: 'white' },
        });
        return;
      }
    } catch (error: unknown) {
      toast('a problem occurred while signing out!', {
        style: { backgroundColor: 'red', color: 'white' },
      });
      console.error(error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-lg">
      <div className="relative container mx-auto px-6 py-4 flex items-center justify-between w-full">
        {/* Left: Logo and App Name */}
        <div
          className="flex items-center space-x-3 flex-1 hover:cursor-pointer"
          onClick={() => {
            router.push('/dashboard/home');
          }}
        >
          <Image src="/logo.png" alt="logo" width={50} height={50} />
          <h1 className="text-xl font-bold text-white">Work App</h1>
        </div>

        {/* Right: Nav + Mobile Toggle */}
        <div className="md:flex md:items-center md:justify-end space-x-4">
          {/* Mobile Menu Toggle */}
          <button
            className="text-white md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          {/* Nav Menu */}
          <nav
            className={`
              ${menuOpen ? 'block' : 'hidden'} 
              absolute top-full left-0 w-full bg-blue-900 z-50
              md:z-auto md:static md:bg-transparent
              md:flex md:items-center
              space-y-4 md:space-y-0 md:space-x-6
              p-4 md:p-0
            `}
          >
            {[
              { label: 'Residences', href: '/dashboard/group-homes' },
              { label: 'Documents', href: '/dashboard/documents' },
              { label: 'Schedules', href: '/dashboard/schedules' },
              { label: 'Timesheets', href: '/dashboard/timesheets' },
              { label: 'Staff Directory', href: '/dashboard/staff-directory' },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="block text-white hover:text-blue-300 transition-colors duration-200"
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <button
              className="hover:brightness-110 hover:cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar>
                    <AvatarImage src="/userIcon.png" alt="user profile image" />
                    <AvatarFallback>USER</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-lg text-white rounded-md p-2 border-none">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
