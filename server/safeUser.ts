export const safeUser = (user: any) => ({
  _id: user._id, name: user.name, email: user.email, phone: user.phone, address: user.address,
  role: user.role, emailVerified: user.emailVerified, accountStatus: user.accountStatus,
  profileImage: user.profileImage, zoneId: user.zoneId, createdAt: user.createdAt
});
