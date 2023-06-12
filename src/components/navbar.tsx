import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Disclosure, Menu, Transition } from "@headlessui/react";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { api } from "~/utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useTheme } from 'next-themes'
import { useUserContext } from "~/provider";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const { user } = useUserContext();
  const router = useRouter();
  const { theme, setTheme } = useTheme()

  const iconColors = " text-neutral-400 hover:bg-neutral-200 hover:text-black dark:bg-neutral-800 dark:hover:bg-neutral-700 dark:hover:text-white"

  const navigation = [
    { name: "Home", href: "/", current: router.pathname === "/" },
    {
      name: "Floorplan",
      href: "/floorplan",
      current: router.pathname === "/floorplan",
    },
    { name: "Alerts", href: "/alerts", current: router.pathname === "/alerts" },
    {
      name: "Grendel",
      href: "/grendel",
      current: router.pathname === "/grendel",
    },
  ];
  const profile_menu = [
    { name: "Your Profile", href: "/profile" },
    { name: "Settings", href: "/settings" },
  ];

  const logout_req = api.auth.logout.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const { setUser } = useUserContext();

  const handleLogout = () => {
    logout_req.mutate();
    setUser(null);
  }
  return (
    <Disclosure as="nav" className="bg-white dark:bg-neutral-800">
      {({ open }) => (
        <>
          <div className="px-8 sm:max-lg:px-4">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-neutral-400 hover:bg-neutral-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:bg-neutral-700">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Image
                    src="/favicon.ico"
                    alt="UBCCR"
                    width={36}
                    height={36}
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={classNames(
                          item.current
                            ? "bg-neutral-100 dark:bg-neutral-900 dark:text-white"
                            : "text-neutral-600 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700 dark:hover:text-white",
                          "rounded-md px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                {/* <button
                  type="button"
                  className="rounded-full bg-neutral-800 p-1 text-neutral-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-neutral-800"
                >
                  <span className="sr-only">View notifications</span>
                  <BellIcon className="h-6 w-6" aria-hidden="true" />
                </button> */}
                <button type="button" onClick={() => { setTheme(theme === "dark" ? "light" : "dark")}}>
                  {theme === "dark" ? (
                    <SunIcon className={"h-6 w-6 rounded-lg m-1" + iconColors} />
                  ) : (
                    <MoonIcon className={"h-6 w-6 rounded-lg m-1" + iconColors} />
                  )}
                </button>

                {/* Profile dropdown */}
                {!user && (
                  <div className={"flex rounded-full text-sm" + iconColors}>
                    <Link href={"/auth/login"}>
                      <ArrowLeftOnRectangleIcon className="m-1 h-6 w-6" />
                    </Link>
                  </div>
                )}
                {!!user && (
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className={"flex rounded-full text-sm" + iconColors}>
                        <span className="sr-only">Open user menu</span>
                        <UserCircleIcon className="m-1 h-6 w-6" />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="dark:bg-netural-800 absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-neutral-800">
                        {profile_menu.map((item, index) => (
                          <Menu.Item key={index}>
                            {({ active }) => (
                              <Link
                                href={item.href}
                                className={classNames(
                                  active
                                    ? "bg-neutral-100 dark:bg-neutral-700"
                                    : "",
                                  "block px-4 py-2 text-sm text-neutral-700 dark:text-white"
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                            <Menu.Item>
                            {({ active }) => (
                              <Link
                              href="/"
                                onClick={() => handleLogout()}
                                className={classNames(
                                  active
                                    ? "bg-neutral-100 dark:bg-neutral-700"
                                    : "",
                                  "block px-4 py-2 text-sm text-neutral-700 dark:text-white"
                                )}
                              >
                                Logout
                              </Link>
                            )}
                            </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                )}
              </div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-300 hover:bg-neutral-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
