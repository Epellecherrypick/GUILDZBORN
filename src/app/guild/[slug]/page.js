import { initialGuilds } from '../../components/guild-data';
import GuildDetailsClient from './guild-details-client';

export async function generateStaticParams() {
  return initialGuilds.map((guild) => ({
    slug: guild.slug,
  }));
}
/**
 * This is the main Page component, which is a Server Component.
 * It fetches the initial data and passes it to the Client Component.
 */
export default function Page({ params }) {
  const { slug } = params;
  // On the server, we can find the initial guild data directly.
  const initialGuild = initialGuilds.find((g) => g.slug === slug);

  // We render the Client Component and pass the initial data as a prop.
  return <GuildDetailsClient initialGuild={initialGuild} />;
}
