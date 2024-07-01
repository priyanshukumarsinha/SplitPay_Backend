import {prisma} from '../../prisma/index.js'
import { ApiError, ApiResponse, asyncHandler} from '../utils/index.js'

// createGroup to create a new group : POST /api/group/create
const createGroup = asyncHandler(async (req, res) => {
    // Check if all details are provided : name and amount are necessary
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

// getGroup to get a group : GET /api/group/:id
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



const getGroups = async (req, res) => {
    try {
        const groups = await prisma.group.findMany({
            where:{
                OR: [
                    {adminId: req.user.id},
                    {members: {some: {userId: req.user.id}}}
                ]
            }
        })
        if(!groups){
            return res.status(400).json({
                status : 400,
                message : "Groups Not Found"
            })
        }

        return res.status(200).json({
            status : 200,
            groups : groups
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Fetching Groups",
            error : error,
            errorMSG : error.message
        })
    }
}

const getGroupMembers = async (req, res) => {
    try {
        const members = await prisma.groupMembers.findMany({
            where:{
                groupId : parseInt(req.params.id) 
            }
        })

        if(!members){
            return res.status(400).json({
                status : 400,
                message : "Members Not Found"
            })
        }

        const group = await prisma.group.findFirst({
            where:{
                id : parseInt(req.params.id)
            }
        })

        const ifGroupMember = await prisma.groupMembers.findFirst({
            where:{
                groupId : parseInt(req.params.id),
                userId : req.user.id
            }
        }) || group.adminId === req.user.id

        if(!ifGroupMember) return res.status(400).json({
            status : 400,
            message : "You are not a Member of this Group"
        })

        return res.status(200).json({
            status : 200,
            members : members
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Fetching Members",
            error : error
        })
    }
}

const addToGroup = async (req, res) => {
    try {
        const existingMember = await prisma.groupMembers.findFirst({
            where:{
                userId : req.body.userId,
                groupId : req.body.groupId
            }
        })

        if(existingMember){
            return res.status(400).json({
                status : 400,
                message : "Member Already Exists"
            })
        }

        const group = await prisma.group.findFirst({
            where:{
                id : req.body.groupId
            }
        })

        const ifGroupMember = await prisma.groupMembers.findFirst({
            where:{
                userId : req.body.userId,
                groupId : req.body.groupId
            }
        }) || group.adminId === req.user.id

        if(!ifGroupMember) return res.status(400).json({
            status : 400,
            message : "You are not a Member of this Group"
        })

        const totalMembers = await prisma.groupMembers.findMany({
            where:{
                groupId : req.body.groupId
            }
        })

        const share = group.amount / (totalMembers.length+2)

        // update share in all groupmember
        totalMembers.forEach(async (member) => {
            await prisma.groupMembers.update({
                where:{
                    id : member.id
                },
                data:{
                    share : share
                }
            })
        })

        const member = await prisma.groupMembers.create({
            data:{
                userId : req.body.userId,
                groupId : req.body.groupId,
                share : share
            }
        })

        if(!member){
            return res.status(400).json({
                status : 400,
                message : "Error while Adding Member"
            })
        }

        return res.status(200).json({
            status : 200,
            message : "Member Added Successfully",
            member : member
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Adding Member",
            error : error
        })
    }
}

const removeMember = async (req, res) => {
    try {
        const group = await prisma.group.findFirst({
            where:{
                id : req.body.groupId
            }
        })

        if(!group) return res.status(400).json({
            status : 400,
            message : "Group Not Found"
        })

        const ifGroupMember = await prisma.groupMembers.findFirst({
            where:{
                userId : req.body.userId,
                groupId : req.body.groupId
            }
        }) 

        if(!(group.adminId === req.user.id || ifGroupMember)) return res.status(400).json({
            // if not a member
            status : 400,
            message : "You are not a Member of this Group"
        }) 

        const member = await prisma.groupMembers.delete({
            where:{
                id : ifGroupMember.id
            }
        })

        if(!member){
            return res.status(400).json({
                status : 400,
                message : "Error while Removing Member"
            })
        }

        return res.status(200).json({
            status : 200,
            message : "Member Removed Successfully",
            member : member
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Member Not Found",
            error : error,
            errorMSG : error.message
        })
    }

}

export {createGroup, getGroup, getGroups, getGroupMembers, addToGroup, removeMember}