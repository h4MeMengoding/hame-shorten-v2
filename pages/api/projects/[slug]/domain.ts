import { NextApiRequest, NextApiResponse } from 'next';

import { changeDomainForLinks } from '@/lib/api/links';
import { withProjectAuth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validDomainRegex } from '@/lib/utils';

export default withProjectAuth(async (req: NextApiRequest, res: NextApiResponse, project, session) => {
  if (!session?.user?.superadmin && !['manager', 'owner'].includes(project.users[0]?.role))
    return res.status(403).send({ error: 'Missing permissions' });

  if (req.method === 'PUT') {
    const { slug } = req.query as { slug: string };
    const domain = project.domain;
    const newDomain = req.body;

    const validDomain = typeof newDomain === 'string' ? validDomainRegex.test(newDomain) : false;
    if (!validDomain)
      return res.status(422).json({
        domainError: 'Invalid domain'
      });

    if (domain !== newDomain) {
      // make sure domain doesn't exist
      const existingProject = await prisma.project.findUnique({
        where: { domain: newDomain },
      });

      if (existingProject) {
        return res.status(409).json({
          domainError: 'Domain already exists'
        });
      }

      await changeDomainForLinks(project.id, domain, newDomain);
    }

    res.status(200).json({});
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
});
