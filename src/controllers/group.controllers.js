import {prisma} from '../../prisma/index.js'
import { ApiError, ApiResponse, asyncHandler} from '../utils/index.js'

// createGroup to create a new group : POST /api/group/create : testing done
const createGroup = asyncHandler(async (req, res) => {
    // Check if all details are provided : name and amount are necessary
    console.log(req.body)

    if (!req.body.name || !req.body.amount) {
        throw new ApiError(400, 'Please provide all the details');
    }

    // Check if the group already exists
    const existingGroup = await prisma.group.findFirst({
        where: {
            name: req.body.name,
        },
    });

    if (existingGroup) {
        throw new ApiError(400, 'Group already exists');
    }

    // Create the group
    const group = await prisma.group.create({
        data: {
            name: req.body.name,
            description: req.body.description,
            adminId: req.user.id,
            currency: req.body.currency,
            groupTypes: req.body.groupTypes,
            amount: req.body.amount,
        }
    });

    // Check if the group was created
    if (!group) {
        throw new ApiError(500, 'Error while creating the group');
    }

    // Add the admin to the group
    await prisma.groupMembers.create({
        data: {
            userId: req.user.id,
            groupId: group.id,
            share: group.amount,
        },
    });
    

    // Check if members are provided
    if (req.body.members) {
        // Loop through the members
        req.body.members.forEach(async (member) => {
            // Check if the member already exists
            const existingMember = await prisma.groupMembers.findFirst({
                where: {
                    userId: member,
                    groupId: group.id,
                },
            });

            if (existingMember) {
                throw new ApiError(400, 'Member already exists');
            }
            
            // Add the member to the group
            await prisma.groupMembers.create({
                data: {
                    userId: member,
                    groupId: group.id,
                },
            });


            // Update Share of all Members
            const totalMembers = await prisma.groupMembers.findMany({
                where: {
                    groupId: group.id,
                },
            });

            const share = group.amount / (totalMembers.length);

            // Update share in all groupMembers
            totalMembers.forEach(async (member) => {
                await prisma.groupMembers.update({
                    where: {
                        id: member.id,
                    },
                    data: {
                        share: share,
                    },
                });
            });

        });
    }

    // Send the response
    const response = new ApiResponse(200, group, 'Group created successfully');
    return res.status(200).json(response);
    
});

// getGroup to get a group : GET /api/group/:id : testing done
const getGroup = asyncHandler(async (req, res) => {
    // Check if the id is provided
    if (!req.params.id) {
        throw new ApiError(400, 'Please provide the group id');
    }


    // Find the group
    const group = await prisma.group.findFirst({
        where: {
            id: parseInt(req.params.id),
        },
    });

    // Check if the group exists
    if (!group) {
        throw new ApiError(400, 'Group not found');
    }

    // Check if the user is a member of the group
    const ifGroupMember = await prisma.groupMembers.findFirst({
        where: {
            groupId: parseInt(req.params.id),
            userId: req.user.id,
        },
    });

    // find all group members 
    let members = await prisma.groupMembers.findMany({
        where: {
            groupId: parseInt(req.params.id),
        },
        select : {
            userId : true,
        }
    });

    // get an array of members
    members = members.map((member) => member.userId);

    // get all user details from members and add it in group.members
    for (let i = 0; i < members.length; i++) {
        const user = await prisma.user.findFirst({
            where: {
                id: members[i],
            },
            select: {
                id: true,
                username: true,
                email: true,
                photoURL: true,
            },
        });

        // update the member array with user details
        members[i] = user;
    }

    // add the members array to the group object
    group.members = members;

    // if the user is a group member then only show the group details
    // else throw error
    if (!ifGroupMember) {
        throw new ApiError(400, 'You are not a member of this group');
    }

    // Send the response
    const response = new ApiResponse(200, group, 'Group found successfully');
    return res.status(200).json(response);
});

// addToGroup to add a member to a group : POST /api/group/add
const addToGroup = asyncHandler(async (req, res) => {
    // Check if the user id and group id are provided
    if (!req.body.userId || !req.body.groupId) {
        throw new ApiError(400, 'Please provide the user id and group id');
    }

    // Check if the member already exists
    const existingMember = await prisma.groupMembers.findFirst({
        where: {
            userId: req.body.userId,
            groupId: req.body.groupId,
        },
    });

    if (existingMember) {
        throw new ApiError(400, 'Member already exists');
    }

    // Find the group
    const group = await prisma.group.findFirst({
        where: {
            id: req.body.groupId,
        },
    });

    // Check if the user is a member of the group
    const ifGroupMember = await prisma.groupMembers.findFirst({
        where: {
            userId: req.user.id,
            groupId: req.body.groupId,
        }
    })

    if (!ifGroupMember) {
        throw new ApiError(400, 'You are not a member of this group');
    }

    // Update Share of all Members
    const totalMembers = await prisma.groupMembers.findMany({
        where: {
            groupId: group.id,
        },
    });

    const share = group.amount / (totalMembers.length);

    // Update share in all groupMembers
    totalMembers.forEach(async (member) => {
        await prisma.groupMembers.update({
            where: {
                id: member.id,
            },
            data: {
                share: share,
            },
        });
    });

    // Add the member to the group
    const member = await prisma.groupMembers.create({
        data: {
            userId: req.body.userId,
            groupId: req.body.groupId,
            share: share,
        },
    });

    // Check if the member was added
    if (!member) {
        throw new ApiError(500, 'Error while adding the member');
    }

    // Send the response
    const response = new ApiResponse(200, member, 'Member added successfully');
    return res.status(200).json(response);
});

// removeMember to remove a member from a group : DELETE /api/group/remove
const removeMember = asyncHandler(async (req, res) => {
    // Check if the user id and group id are provided
    if (!req.body.userId || !req.body.groupId) {
        throw new ApiError(400, 'Please provide the user id and group id');
    }

    // Find the group
    const group = await prisma.group.findFirst({
        where: {
            id: req.body.groupId,
        },
    });

    // Check if the user is a member of the group
    const ifGroupMember = await prisma.groupMembers.findFirst({
        where: {
            userId: req.user.id,
            groupId: req.body.groupId,
        }
    })

    if (!ifGroupMember) {
        throw new ApiError(400, 'You are not a member of this group');
    }

    // find groupMember instance id
    const groupMember = await prisma.groupMembers.findFirst({
        where: {
            userId: req.body.userId,
            groupId: req.body.groupId,
        },
    });

    // Remove the member from the group
    const member = await prisma.groupMembers.delete({
        where: {
            id: groupMember.id,
        },
    });

    // Check if the member was removed
    if (!member) {
        throw new ApiError(500, 'Error while removing the member');
    }

    // Update Share of all Members
    const totalMembers = await prisma.groupMembers.findMany({
        where: {
            groupId: group.id,
        },
    });

    const share = group.amount / (totalMembers.length);

    // Update share in all groupMembers
    totalMembers.forEach(async (member) => {
        await prisma.groupMembers.update({
            where: {
                id: member.id,
            },
            data: {
                share: share,
            },
        });
    });

    // Send the response
    const response = new ApiResponse(200, member, 'Member removed successfully');
    return res.status(200).json(response);
});

// deleteGroup to delete a group : DELETE /api/group/delete

// updateGroup to update a group : PUT /api/group/update
const updateGroup = asyncHandler(async (req, res) => {
    // Check if the group id is provided
    if (!req.body.groupId) {
        throw new ApiError(400, 'Please provide the group id');
    }

    // Find the group
    const group = await prisma.group.findFirst({
        where: {
            id: req.body.groupId,
        },
    });

    // Check if the user is a member of the group
    const ifGroupMember = await prisma.groupMembers.findFirst({
        where: {
            userId: req.user.id,
            groupId: req.body.groupId,
        }
    })

    if (!ifGroupMember) {
        throw new ApiError(400, 'You are not a member of this group');
    }

    // Update the group
    const updatedGroup = await prisma.group.update({
        where: {
            id: req.body.groupId,
        },
        data: {
            name: req.body.name,
            description: req.body.description,
            currency: req.body.currency,
            groupTypes: req.body.groupTypes,
            amount: req.body.amount,
        },
    });

    // Check if the group was updated
    if (!updatedGroup) {
        throw new ApiError(500, 'Error while updating the group');
    }

    // Send the response
    const response = new ApiResponse(200, updatedGroup, 'Group updated successfully');
    return res.status(200).json(response);
});

export {createGroup, getGroup, addToGroup, removeMember, updateGroup}