import { NextApiRequest, NextApiResponse } from 'next';

import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res);
  if (!session?.user.id) return res.status(401).send({ error: 'Unauthorized' });

  const { slug } = req.query as { slug: string };

  // GET /api/projects/[slug]/exists – check if a project exists
  if (req.method === 'GET') {
    const project = await prisma.project.findUnique({
      where: {
        slug
      },
      select: {
        slug: true
      }
    });
    if (project) {
      return res.status(200).json(1);
    } else {
      return res.status(200).json(0);
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
