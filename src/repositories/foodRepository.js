import prisma from '../config/prisma.js';

export const findAll = async ({ skip, take, search, categoryId, isAvailable }) => {
    const where = {};

    if (search) {
        where.name = { contains: search, mode: 'insensitive' };
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (isAvailable !== undefined) {
        where.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    const [data, total] = await Promise.all([
        prisma.food.findMany({
            where,
            skip,
            take,
            include: { category: true },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.food.count({ where })
    ]);

    return { data, total };
};

export const findById = async (id) => {
    return prisma.food.findUnique({
        where: { id },
        include: { category: true }
    });
};

export const create = async (data) => {
    return prisma.food.create({
        data,
        include: { category: true }
    });
};

export const update = async (id, data) => {
    return prisma.food.update({
        where: { id },
        data,
        include: { category: true }
    });
};

export const deleteFood = async (id) => {
    return prisma.food.delete({
        where: { id }
    });
};