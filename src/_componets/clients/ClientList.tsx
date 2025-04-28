import Client from '@/_componets/clients/Client';
import { ResidentFetch } from '@/interfaces/clientInterface';

interface ClientListProps {
  clientArray: ResidentFetch[];
}

export default function ClientList({ clientArray }: ClientListProps) {
  if (clientArray.length === 0) {
    return (
      <div className="flex justify-center items-center w-full p-10 bg-purple-50 rounded-md text-purple-700 font-semibold shadow">
        No clients found.
      </div>
    );
  }

  return (
    <>
      {clientArray.map((client, _) => (
        <Client
          key={client.id}
          firstName={client.firstName}
          lastName={client.lastName}
          clientImage={client.image_url || '/defaultUser.jpg'}
          clientId={client.id}
        />
      ))}
    </>
  );
}
