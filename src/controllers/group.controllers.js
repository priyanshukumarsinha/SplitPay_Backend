import {prisma} from '../../prisma/index.js'

const createGroup = async (req, res) => {
    try {
        const existingGroup = await prisma.group.findFirst({
            where:{
                name : req.body.name
            }
        })
        if(existingGroup) return res.status(400).json({
            status : 400,
            message : "Group Already Exists"
        })

        const group = await prisma.group.create({
            data:{
                name : req.body.name,
                description : req.body.description,
                adminId : req.user.id,
                currecy : req.body.currency,
                groupTypes : req.body.groupTypes,
            }
        })

        if(!group){
            return res.status(400).json({
                status : 400,
                message : "Error while Creating Group"
            })
        }

        if(req.body.members){
            try {
                req.body.members.forEach(async (member) => {
                    const existingMember = await prisma.groupMembers.findFirst({
                        where:{
                            userId : member,
                            groupId : group.id
                        }
                    })
                    if(existingMember) throw new Error("Member Already Exists");
                    
                    await prisma.groupMembers.create({
                        data:{
                            userId : member,
                            groupId : group.id
                        }
                    })
                })
            } catch (error) {
                return res.status(400).json({
                    status : 400,
                    message : "Error while Adding Members to Group",
                    error : error
                })
            }
        }


        return res.status(200).json({
            status : 200,
            message : "Group Created Successfully",
            group : group
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Creating Group",
            error : error
        })
    }
}

const getGroup = async (req, res) => {
    try {
        const group = await prisma.group.findFirst({
            where:{
                id : parseInt(req.params.id)
            }
        })

        if(!group){
            return res.status(400).json({
                status : 400,
                message : "Group Not Found"
            })
        }

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
            group : group
        })
    } catch (error) {
        return res.json({
            status : 500,
            message : "Error while Fetching Group",
            error : error,
            errorMSG : error.message
        })
    }
}

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

        const member = await prisma.groupMembers.create({
            data:{
                userId : req.body.userId,
                groupId : req.body.groupId
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