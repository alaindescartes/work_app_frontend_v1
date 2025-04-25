import Client from '@/_componets/clients/Client';

export default function ClientList({}) {
  const clients: number[] = Array(5).fill('1');

  return (
    <>
      {clients.map((client, index) => (
        <Client key={index} />
      ))}
    </>
  );
}
