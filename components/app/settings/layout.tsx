import AppLayout from 'components/layout/app';
import ErrorPage from 'next/error';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';

import { useAcceptInviteModal } from '@/components/app/modals/accept-invite-modal';
import MaxWidthWrapper from '@/components/shared/max-width-wrapper';
import useProject from '@/lib/swr/use-project';

export default function SettingsLayout({ children, pageTitle }: { children: ReactNode; pageTitle?: string }) {
  const router = useRouter();
  const { slug } = router.query as {
    slug?: string;
  };
  const { error } = useProject();
  const { AcceptInviteModal, setShowAcceptInviteModal } = useAcceptInviteModal();

  // handle errors
  useEffect(() => {
    if (error && (error.status === 409 || error.status === 410)) {
      setShowAcceptInviteModal(true);
    }
  }, [error]);

  if (error && error.status === 404) {
    return <ErrorPage statusCode={404} />;
  }

  const tabs = [
    {
      name: 'General',
      href: `/p/${slug}/settings`
    },
    {
      name: 'People',
      href: `/p/${slug}/settings/people`
    }
  ];

  return (
    <AppLayout bgWhite pageTitle={pageTitle}>
      {error && (error.status === 409 || error.status === 410) && <AcceptInviteModal />}
      <div className="flex h-36 items-center border-b border-gray-200 bg-white">
        <MaxWidthWrapper>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl text-gray-600">Settings</h1>
          </div>
        </MaxWidthWrapper>
      </div>
      <MaxWidthWrapper className="grid grid-cols-5 items-start gap-5 py-10">
        <div className="col-span-1 grid gap-1">
          {tabs.map(({ name, href }) => (
            <Link href={href}>
              <a
                className={`${
                  router.asPath === href ? 'font-semibold text-black' : ''
                } rounded-md p-2.5 text-sm transition-all duration-75 hover:bg-gray-100 active:bg-gray-200`}
              >
                {name}
              </a>
            </Link>
          ))}
        </div>
        <div className="col-span-4 grid gap-5">{children}</div>
      </MaxWidthWrapper>
    </AppLayout>
  );
}
