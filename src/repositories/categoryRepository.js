import prisma from '../config/prisma.js';

export const findAll = async () => {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { foods: true } } },
    });
};

export const findById = async (id) => {
    return prisma.category.findUnique({
        where: { id },
    });
};

export const findBySlug = async (slug) => {
    return prisma.category.findUnique({
        where: { slug },
    });
};

export const create = async (data) => {
    return prisma.category.create({
        data,
    });
};

export const update = async (id, data) => {
    return prisma.category.update({
        where: { id },
        data,
    });
};

export const deleteCategory = async (id) => {
    return prisma.category.delete({
        where: { id },
    });
};