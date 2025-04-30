'use client';

import { useParams } from 'next/navigation';
import ClientInfo from '@/_componets/clients/ClientInfo';

export default function Page() {
  const params = useParams();
  const clientId = params.clientId as string;

  return (
    <>
      <ClientInfo clientId={clientId} />
    </>
  );
}
