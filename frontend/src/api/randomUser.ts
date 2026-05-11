export type GuestInstructor = {
  name: string;
  photo: string;
  email: string;
};

export const fetchGuestInstructor = async (): Promise<GuestInstructor> => {
  const response = await fetch("https://randomuser.me/api/?nat=br,us,gb");

  if (!response.ok) {
    throw new Error("Nao foi possivel carregar o instrutor convidado");
  }

  const payload = await response.json();
  const user = payload.results[0];

  return {
    name: `${user.name.first} ${user.name.last}`,
    photo: user.picture.large,
    email: user.email
  };
};
