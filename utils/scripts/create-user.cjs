// node utils/scripts/create-user.cjs

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function createUser() {
  const prisma = new PrismaClient();
  
  try {
    // Проверяем, есть ли уже пользователь
    const existingUser = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return;
    }

    // Создаем хешированный пароль
    const hashedPassword = await bcrypt.hash('admin', 12);
    
    // Создаем пользователя
    const user = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword
      }
    });
    
    console.log('User created successfully:', { id: user.id, username: user.username });
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 