# This file is part of Buildbot.  Buildbot is free software: you can
# redistribute it and/or modify it under the terms of the GNU General Public
# License as published by the Free Software Foundation, version 2.
#
# This program is distributed in the hope that it will be useful, but WITHOUT
# ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# this program; if not, write to the Free Software Foundation, Inc., 51
# Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
#
# Copyright Buildbot Team Members

import os
from twisted.trial import unittest
from buildbot.status import builder, master
from buildbot.test.fake import fakemaster

class TestBuildStepStatus(unittest.TestCase):

    # that buildstep.BuildStepStatus is never instantiated here should tell you
    # that these classes are not well isolated!

    def setupBuilder(self, buildername, category=None, description=None):
        self.master = fakemaster.make_master()
        self.master.basedir = '/basedir'

        b = builder.BuilderStatus(buildername, self.master, category, description)
        b.project = "Project"
        b.master = self.master
        # Ackwardly, Status sets this member variable.
        b.basedir = os.path.abspath(self.mktemp())
        os.mkdir(b.basedir)
        # Otherwise, builder.nextBuildNumber is not defined.
        b.determineNextBuildNumber()
        return b

    def setupStatus(self, b):
        s = master.Status(self.master)
        b.status = s
        return s

    def testBuildStepNumbers(self):
        b = self.setupBuilder('builder_1')
        bs = b.newBuild()
        self.assertEquals(0, bs.getNumber())
        bss1 = bs.addStepWithName('step_1', None)
        self.assertEquals('step_1', bss1.getName())
        bss2 = bs.addStepWithName('step_2', None)
        self.assertEquals(0, bss1.asDict()['step_number'])
        self.assertEquals('step_2', bss2.getName())
        self.assertEquals(1, bss2.asDict()['step_number'])
        self.assertEquals([bss1, bss2], bs.getSteps())

    def testLogDict(self):
        b = self.setupBuilder('builder_1')
        self.setupStatus(b)
        bs = b.newBuild()
        bss1 = bs.addStepWithName('step_1', None)
        bss1.stepStarted()
        bss1.addLog('log_1')
        self.assertEquals(
            bss1.asDict()['logs'],
            [['log_1', ('http://localhost:8080/projects/Project/builders/builder_1/'
                        'builds/0/steps/step_1/logs/log_1')]]
            )

    def testaddHtmlLog_with_no_content_type(self):
        b = self.setupBuilder('builder_1')
        self.setupStatus(b)
        bs = b.newBuild()
        bss1 = bs.addStepWithName('step_1', None)
        bss1.stepStarted()
        bss1.addHTMLLog('htmllog_1', "html")

        self.assertEquals(
            bss1.asDict()['logs'],
            [['htmllog_1', ('http://localhost:8080/projects/Project/builders/builder_1/'
                        'builds/0/steps/step_1/logs/htmllog_1')]]
            )
        self.assertEqual(len(bss1.logs), 1)
        self.assertEqual(bss1.logs[0].content_type, None)

    def testaddHtmlLog_with_content_type(self):
        b = self.setupBuilder('builder_1')
        self.setupStatus(b)
        bs = b.newBuild()
        bss1 = bs.addStepWithName('step_1', None)
        bss1.stepStarted()
        content_type = "test_content_type"
        bss1.addHTMLLog('htmllog_1', "html", content_type)

        self.assertEqual(len(bss1.logs), 1)
        self.assertEqual(bss1.logs[0].content_type, content_type)

    def testaddHtmlLog_with_content_type_multiple_logs(self):
        b = self.setupBuilder('builder_1')
        self.setupStatus(b)
        bs = b.newBuild()
        bss1 = bs.addStepWithName('step_1', None)
        bss1.stepStarted()
        content_type1 = "test_content_type"
        content_type2 = "json"
        bss1.addHTMLLog('htmllog_1', "html", content_type1)
        bss1.addHTMLLog('htmllog_2', "html 2")
        bss1.addHTMLLog('htmllog_3', "html 2", content_type2)

        self.assertEqual(len(bss1.logs), 3)
        self.assertEqual(bss1.logs[0].content_type, content_type1)
        self.assertEqual(bss1.logs[1].content_type, None)
        self.assertEqual(bss1.logs[2].content_type, content_type2)


    def test_addURLs(self):
        b = self.setupBuilder('builder_1')
        self.setupStatus(b)
        bs = b.newBuild()
        bss1 = bs.addStepWithName('step_1', None)
        bss1.stepStarted()

        urlList = dict()
        urlList["URL"] = "http://www.url"
        urlList["URL2"] = "http://www.url2"

        bss1.addURL("URL", "http://www.url")
        bss1.addURL("URL2", "http://www.url2")
        self.assertEquals(bss1.getURLs(), urlList)

    def test_prepare_trigger_links_for_nontrigger(self):
        from buildbot.steps.shell import ShellCommand
        builder = self.setupBuilder('builder_1')
        self.setupStatus(builder)
        build = builder.newBuild()

        shell_step_status = build.addStepWithName('step_1', ShellCommand)
        shell_step_status.prepare_trigger_links()
        self.assertEqual(len(shell_step_status.urls), 0)

    def test_prepare_trigger_link_for_trigger(self):
        from buildbot.steps.trigger import Trigger

        class StubBuildRequest(object):
            def getBuildRequestForStartbrids(self, brids):
                return [{'buildername': 'foo', 'number': brids[0], 'results': 1}]

        class StubDB(object):
            def __init__(self):
                self.buildrequests = StubBuildRequest()

        builder = self.setupBuilder('builder_1')
        self.setupStatus(builder)
        build = builder.newBuild()
        trigger_step_status = build.addStepWithName('step_2', Trigger)
        build.builder.master.db = StubDB()
        build.brids = [1]
        build.builder.master.status.getURLForBuild = lambda x,y: {'path':x, 'text': y}

        self.assertEqual(len(trigger_step_status.urls), 0)

        trigger_step_status.prepare_trigger_links()

        self.assertEqual(len(trigger_step_status.urls), 1)

    def test_prepare_trigger_link_for_trigger_with_empty_children(self):
        from buildbot.steps.trigger import Trigger

        class StubBuildRequest(object):
            def getBuildRequestForStartbrids(self, brids):
                return []

        class StubDB(object):
            def __init__(self):
                self.buildrequests = StubBuildRequest()

        builder = self.setupBuilder('builder_1')
        self.setupStatus(builder)
        build = builder.newBuild()
        trigger_step_status = build.addStepWithName('step_2', Trigger)
        build.builder.master.db = StubDB()
        build.brids = [1]
        build.builder.master.status.getURLForBuild = lambda x,y: {'path':x, 'text': y}

        self.assertEqual(len(trigger_step_status.urls), 0)

        trigger_step_status.prepare_trigger_links()

        self.assertEqual(len(trigger_step_status.urls), 0)
