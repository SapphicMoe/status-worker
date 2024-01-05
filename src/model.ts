const PREFIX = "v1:status:";

export interface Status {
  id: string;
  title: string;
  body: string;
  date: string;
}

export type Param = {
  title: string;
  body: string;
  date: string;
};

const generateID = (key: string) => {
  return `${PREFIX}${key}`;
};

export const getStatuses = async (KV: KVNamespace): Promise<Status[]> => {
  const list = await KV.list({ prefix: PREFIX });
  const keys = list.keys;
  const statuses: Status[] = [];

  const len = keys.length;
  for (let i = 0; i < len; i++) {
    const value = await KV.get(keys[i].name);
    if (value) {
      const status: Status = JSON.parse(value);
      statuses.push(status);
    }
  }

  return statuses;
};

export const getStatus = async (
  KV: KVNamespace,
  id: string
): Promise<Status | undefined> => {
  const value = await KV.get(generateID(id));
  if (!value) return;

  const status: Status = JSON.parse(value);

  return status;
};

export const createStatus = async (
  KV: KVNamespace,
  param: Param
): Promise<Status | undefined> => {
  if (!(param && param.title && param.body)) return;
  const id = crypto.randomUUID();

  const newStatus: Status = { 
    id, 
    title: param.title, 
    body: param.body, 
    date: new Date().toISOString()
  };

  await KV.put(generateID(id), JSON.stringify(newStatus));

  return newStatus;
};

export const updateStatus = async (
  KV: KVNamespace,
  id: string,
  param: Param
): Promise<boolean> => {
  if (!(param && param.title && param.body)) return false;
  const status = await getStatus(KV, id);
  if (!status) return false;

  status.title = param.title;
  status.body = param.body;

  await KV.put(generateID(id), JSON.stringify(status));

  return true;
};

export const deleteStatus = async (
  KV: KVNamespace,
  id: string
): Promise<boolean> => {
  const status = await getStatus(KV, id);
  if (!status) return false;

  await KV.delete(generateID(id));

  return true;
};
