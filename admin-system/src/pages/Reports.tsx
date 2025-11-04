import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  Download,
  Calendar,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const Reports = () => {
  const systemStats = [
    {
      title: "Total Users",
      value: "1,247",
      change: "+15%",
      trend: "up",
    },
    {
      title: "Active Courses",
      value: "89",
      change: "+3",
      trend: "up",
    },
    {
      title: "Enrollments",
      value: "3,456",
      change: "+12%",
      trend: "up",
    },
    {
      title: "Completion Rate",
      value: "87.5%",
      change: "+2.3%",
      trend: "up",
    },
  ];

  const coursePerformance = [
    {
      course: "Advanced Mathematics",
      enrollments: 245,
      completions: 198,
      avgGrade: 85.2,
    },
    {
      course: "Physics Laboratory",
      enrollments: 189,
      completions: 156,
      avgGrade: 82.7,
    },
    {
      course: "Computer Science",
      enrollments: 567,
      completions: 489,
      avgGrade: 88.9,
    },
  ];

  const userActivity = [
    {
      role: "Students",
      count: 1089,
      active: 956,
      percentage: 87.8,
    },
    {
      role: "Lecturers",
      count: 145,
      active: 138,
      percentage: 95.2,
    },
    {
      role: "Admins",
      count: 13,
      active: 13,
      percentage: 100,
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            System performance metrics and analytics dashboard
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-primary to-secondary text-white">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${
                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
              }`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Course Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {coursePerformance.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{course.course}</h3>
                  <Badge variant="outline">{course.avgGrade}% avg</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <span>{course.enrollments} enrolled</span>
                  <span>{course.completions} completed</span>
                </div>
                <Progress 
                  value={(course.completions / course.enrollments) * 100} 
                  className="h-2" 
                />
                <div className="text-xs text-muted-foreground">
                  {Math.round((course.completions / course.enrollments) * 100)}% completion rate
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {userActivity.map((activity, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{activity.role}</h3>
                  <Badge variant="outline">{activity.percentage}% active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <span>{activity.count} total</span>
                  <span>{activity.active} active</span>
                </div>
                <Progress value={activity.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            System Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">156</div>
              <p className="text-sm text-muted-foreground">New Users This Week</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-secondary">23</div>
              <p className="text-sm text-muted-foreground">Courses Created</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-success">1,234</div>
              <p className="text-sm text-muted-foreground">Total Logins Today</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
